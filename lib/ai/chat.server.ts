"use server";

import OpenAI from "openai";
import { systemPrompts } from "./prompt";
import { getRelevantMemory, saveMessage, getMemoryStats } from "../memory";

const client = new OpenAI({
  apiKey: process.env.OPENAI_SECRET,
});

export const generateOpenAIText = async (query: string, userId: string) => {
  const relevantMemory = await getRelevantMemory(query, 10);

  console.log("🔍 Retrieved memories:", relevantMemory);

  const stream = await client.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: systemPrompts,
      },
      {
        role: "system",
        content: `These are past messages from a user and you. ${relevantMemory?.join(
          "\n"
        )}`,
      },
      {
        role: "user",
        content: query,
      },
    ],
    stream: true,
  });

  await saveMessage(userId, query, {
    tokens: query.length,
    tags: ["user-input", "question"],
  });

  return new ReadableStream({
    async start(controller) {
      try {
        let fullResponse = "";
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            fullResponse += content;
            controller.enqueue(new TextEncoder().encode(content));
          }
        }

        if (fullResponse) {
          await saveMessage("ai", fullResponse, {
            tokens: fullResponse.length,
            tags: ["ai-response", "generated"],
          });
        }

        controller.close();
      } catch (error) {
        console.error("Streaming error:", error);
        controller.error(error);
      }
    },
  });
};
