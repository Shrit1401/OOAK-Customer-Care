"use server";

import OpenAI from "openai";
import { readFileSync } from "fs";
import { join } from "path";
import { systemPrompts } from "./prompt";

const client = new OpenAI({
  apiKey: process.env.OPENAI_SECRET,
});

export const generateOpenAIText = async (query: string) => {
  const stream = await client.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: systemPrompts,
      },
      {
        role: "user",
        content: query,
      },
    ],
    stream: true,
  });

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            controller.enqueue(new TextEncoder().encode(content));
          }
        }
        controller.close();
      } catch (error) {
        console.error("Streaming error:", error);
        controller.error(error);
      }
    },
  });
};
