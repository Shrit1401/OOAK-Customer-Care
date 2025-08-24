import client from "./chroma";
import { embedText } from "./embeddings";
import { summarizeText } from "../ai/chat.server";

const COLLECTION_NAME = "chat_memory";

interface MemoryEntry {
  id: string;
  content: string;
  phoneNumber: string; 
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

// Helper function to validate phone number format
function validatePhoneNumber(phoneNumber: string): boolean {
  // Allow "ai" as a special case for AI messages, or 10-digit phone numbers
  return phoneNumber === "ai" || /^\d{10}$/.test(phoneNumber);
}

export async function initCollection() {
  try {
    const collection = await client.getOrCreateCollection({
      name: COLLECTION_NAME,
      metadata: { description: "Stores chat history by phone number" },
    });
    return collection;
  } catch (error) {
    console.error("Failed to initialize ChromaDB collection:", error);
    return null;
  }
}

export async function saveMessage(
  phoneNumber: string, // Changed parameter from userId to phoneNumber
  message: string,
  metadata?: Partial<MemoryEntry["metadata"]>
) {
  try {
    // Validate phone number
    if (!validatePhoneNumber(phoneNumber)) {
      console.error("Invalid phone number format:", phoneNumber);
      return;
    }

    const collection = await initCollection();
    if (!collection) {
      console.warn("ChromaDB not available, skipping message save");
      return;
    }

    const embedding = await embedText(message);
    const timestamp = Date.now();
    const id = `${phoneNumber}_${timestamp}`; // Create unique ID with phone number prefix

    const memoryEntry: MemoryEntry = {
      id,
      content: message,
      phoneNumber, // Use phone number instead of userId
      timestamp,
      messageType: phoneNumber === "ai" ? "ai" : "user",
      metadata: {
        embeddingModel: "text-embedding-3-small",
        conversationId: `conv_${phoneNumber}_${Math.floor(timestamp / 86400000)}`,
        ...metadata,
      },
    };

    await collection.add({
      ids: [id],
      embeddings: [embedding],
      documents: [JSON.stringify(memoryEntry)],
      metadatas: [
        {
          phoneNumber, // Store phone number in metadata
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
  phoneNumber: string, // Add phone number parameter to filter by user
  k: number = 5,
  maxLength: number = 500
) {
  try {
    // Validate phone number
    if (!validatePhoneNumber(phoneNumber)) {
      console.error("Invalid phone number format:", phoneNumber);
      return [];
    }

    const collection = await initCollection();
    if (!collection) {
      console.warn("ChromaDB not available, returning empty memory");
      return [];
    }

    const embedding = await embedText(message);

    // Query with phone number filter
    const results = await collection.query({
      queryEmbeddings: [embedding],
      nResults: k * 2, // Get more results to filter by phone number
      where: {
        phoneNumber: phoneNumber, // Filter by phone number
      },
    });

    const documents = results.documents?.[0] || [];
    const distances = results.distances?.[0] || [];

    const relevantMemories = documents.map((doc, index) => {
      try {
        const parsed = JSON.parse(doc || "");
        return {
          content: parsed.content,
          phoneNumber: parsed.phoneNumber, // Use phone number instead of userId
          timestamp: parsed.timestamp,
          messageType: parsed.messageType,
          relevanceScore: distances[index] ? 1 - distances[index] : 0,
        };
      } catch {
        return {
          content: doc || "",
          phoneNumber: "unknown",
          timestamp: Date.now(),
          messageType: "user",
          relevanceScore: 0,
        };
      }
    });

    // Sort by relevance score and take top k
    const sortedMemories = relevantMemories
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, k);

    const processedMemories = await Promise.all(
      sortedMemories.map(async (memory) => {
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

// New function to get all messages for a specific phone number
export async function getUserMessages(phoneNumber: string, limit: number = 50) {
  try {
    // Validate phone number
    if (!validatePhoneNumber(phoneNumber)) {
      console.error("Invalid phone number format:", phoneNumber);
      return [];
    }

    const collection = await initCollection();
    if (!collection) {
      console.warn("ChromaDB not available, returning empty messages");
      return [];
    }

    const results = await collection.get({
      where: {
        phoneNumber: phoneNumber,
      },
      limit: limit,
    });

    const documents = results.documents || [];
    const metadatas = results.metadatas || [];

    return documents.map((doc, index) => {
      try {
        const parsed = JSON.parse(doc || "");
        return {
          content: parsed.content,
          phoneNumber: parsed.phoneNumber,
          timestamp: parsed.timestamp,
          messageType: parsed.messageType,
          metadata: metadatas[index] || {},
        };
      } catch {
        return {
          content: doc || "",
          phoneNumber: phoneNumber,
          timestamp: Date.now(),
          messageType: "user",
          metadata: {},
        };
      }
    }).sort((a, b) => a.timestamp - b.timestamp); // Sort by timestamp
  } catch (error) {
    console.error("Failed to get user messages:", error);
    return [];
  }
}

// New function to delete all messages for a specific phone number
export async function deleteUserMessages(phoneNumber: string) {
  try {
    // Validate phone number
    if (!validatePhoneNumber(phoneNumber)) {
      console.error("Invalid phone number format:", phoneNumber);
      return false;
    }

    const collection = await initCollection();
    if (!collection) {
      console.warn("ChromaDB not available, cannot delete messages");
      return false;
    }

    // Get all IDs for the phone number
    const results = await collection.get({
      where: {
        phoneNumber: phoneNumber,
      },
    });

    const ids = results.ids || [];
    
    if (ids.length > 0) {
      await collection.delete({
        ids: ids,
      });
      console.log(`Deleted ${ids.length} messages for phone number: ${phoneNumber}`);
    }

    return true;
  } catch (error) {
    console.error("Failed to delete user messages:", error);
    return false;
  }
}

