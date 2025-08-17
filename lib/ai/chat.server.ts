"use server";

import OpenAI from "openai";
import { systemPrompts } from "./prompt";
import { getRelevantMemory, saveMessage } from "../chroma/memory";
import { addMessage } from "../db/message.server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_SECRET,
});

export const generateOpenAIText = async (query: string, userId: string) => {
  const relevantMemory = await getRelevantMemory(query, 10);

  const response = await client.chat.completions.create({
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
  });

  await saveMessage(userId, query, {
    tokens: query.length,
    tags: ["user-input", "question"],
  });

  await addMessage(query, "USER");

  const aiResponse = response.choices[0]?.message?.content || "";

  if (aiResponse) {
    await saveMessage("ai", aiResponse, {
      tokens: aiResponse.length,
      tags: ["ai-response", "generated"],
    });

    await addMessage(aiResponse, "ASSISTANT");
  }

  return aiResponse;
};
