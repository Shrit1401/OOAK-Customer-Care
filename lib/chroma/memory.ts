import client from "./chroma";
import { embedText } from "./embeddings";

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

    console.log("💾 Memory saved:", {
      name: `Message from ${userId}`,
      memory: `${message.substring(0, 50)}...`,
      timestamp: new Date(timestamp).toISOString(),
      conversationId: memoryEntry.metadata.conversationId,
      messageType: memoryEntry.messageType,
    });
  } catch (error) {
    console.error("Failed to save message:", error);
  }
}

export async function getRelevantMemory(message: string, k: number = 5) {
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
    const metadatas = results.metadatas?.[0] || [];
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

    console.log("🔍 Relevant memories found:", {
      name: `Query: ${message.substring(0, 30)}...`,
      memory: `${relevantMemories.length} relevant memories`,
      topRelevance: relevantMemories[0]?.relevanceScore?.toFixed(3) || "N/A",
    });

    return relevantMemories.map((m) => m.content);
  } catch (error) {
    console.error("Failed to get relevant memory:", error);
    return [];
  }
}

export async function getMemoryStats() {
  try {
    const collection = await initCollection();
    if (!collection) return null;

    const count = await collection.count();
    const peek = await collection.peek({ limit: 10 });

    const stats = {
      totalMessages: count,
      recentMessages: peek.ids?.length || 0,
      sampleData: peek.documents?.slice(0, 3).map((doc) => {
        try {
          const parsed = JSON.parse(doc || "");
          return {
            name: `Message from ${parsed.userId}`,
            memory: parsed.content.substring(0, 100) + "...",
            timestamp: new Date(parsed.timestamp).toISOString(),
            messageType: parsed.messageType,
          };
        } catch {
          return {
            name: "Unknown",
            memory: (doc || "").substring(0, 100) + "...",
          };
        }
      }),
    };

    console.log("📊 Memory Stats:", stats);
    return stats;
  } catch (error) {
    console.error("Failed to get memory stats:", error);
    return null;
  }
}

export async function getConversationHistory(
  conversationId?: string,
  limit: number = 20
) {
  try {
    const collection = await initCollection();
    if (!collection) return [];

    const where = conversationId ? { conversationId } : undefined;
    const results = await collection.query({
      queryTexts: [""],
      nResults: limit,
      where,
    });

    const conversations =
      results.documents?.[0]
        ?.map((doc) => {
          try {
            return JSON.parse(doc || "");
          } catch {
            return null;
          }
        })
        .filter(Boolean) || [];

    console.log("💬 Conversation history:", {
      name: conversationId || "All conversations",
      memory: `${conversations.length} messages retrieved`,
      timeRange:
        conversations.length > 0
          ? `${new Date(
              conversations[0].timestamp
            ).toISOString()} to ${new Date(
              conversations[conversations.length - 1].timestamp
            ).toISOString()}`
          : "No messages",
    });

    return conversations;
  } catch (error) {
    console.error("Failed to get conversation history:", error);
    return [];
  }
}
