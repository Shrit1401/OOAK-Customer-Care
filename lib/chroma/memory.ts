import client from "./chroma";
import { embedText } from "./embeddings";
import { summarizeText } from "../ai/chat.server";

const COLLECTION_NAME = "chat_memory";

interface MemoryEntry {
  id: string;
  content: string;
  userId: string;
  timestamp: number;
  messageType: "user" | "ai";
  metadata: {
    tokens?: number;
    embeddingModel: string;
    relevanceScore?: number;
    conversationId?: string;
    tags?: string[];
  };
}

export async function initCollection() {
  try {
    const collection = await client.getOrCreateCollection({
      name: COLLECTION_NAME,
      metadata: { description: "Stores chat history" },
    });
    return collection;
  } catch (error) {
    console.error("Failed to initialize ChromaDB collection:", error);
    return null;
  }
}

export async function saveMessage(
  userId: string,
  message: string,
  metadata?: Partial<MemoryEntry["metadata"]>
) {
  try {
    const collection = await initCollection();
    if (!collection) {
      console.warn("ChromaDB not available, skipping message save");
      return;
    }

    const embedding = await embedText(message);
    const timestamp = Date.now();
    const id = timestamp.toString();

    const memoryEntry: MemoryEntry = {
      id,
      content: message,
      userId,
      timestamp,
      messageType: userId === "ai" ? "ai" : "user",
      metadata: {
        embeddingModel: "text-embedding-3-small",
        conversationId: `conv_${Math.floor(timestamp / 86400000)}`,
        ...metadata,
      },
    };

    await collection.add({
      ids: [id],
      embeddings: [embedding],
      documents: [JSON.stringify(memoryEntry)],
      metadatas: [
        {
          userId,
          messageType: memoryEntry.messageType,
          timestamp: memoryEntry.timestamp,
          conversationId: memoryEntry.metadata.conversationId || null,
        },
      ],
    });
  } catch (error) {
    console.error("Failed to save message:", error);
  }
}

export async function getRelevantMemory(
  message: string,
  k: number = 5,
  maxLength: number = 500
) {
  try {
    const collection = await initCollection();
    if (!collection) {
      console.warn("ChromaDB not available, returning empty memory");
      return [];
    }

    const embedding = await embedText(message);

    const results = await collection.query({
      queryEmbeddings: [embedding],
      nResults: k,
    });

    const documents = results.documents?.[0] || [];
    const distances = results.distances?.[0] || [];

    const relevantMemories = documents.map((doc, index) => {
      try {
        const parsed = JSON.parse(doc || "");
        return {
          content: parsed.content,
          userId: parsed.userId,
          timestamp: parsed.timestamp,
          messageType: parsed.messageType,
          relevanceScore: distances[index] ? 1 - distances[index] : 0,
        };
      } catch {
        return {
          content: doc || "",
          userId: "unknown",
          timestamp: Date.now(),
          messageType: "user",
          relevanceScore: 0,
        };
      }
    });

    const processedMemories = await Promise.all(
      relevantMemories.map(async (memory) => {
        if (memory.content.length > maxLength) {
          const summarized = await summarizeText(memory.content);
          return summarized;
        }
        return memory.content;
      })
    );

    return processedMemories;
  } catch (error) {
    console.error("Failed to get relevant memory:", error);
    return [];
  }
}

