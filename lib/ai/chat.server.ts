"use server";

import OpenAI from "openai";
import { systemPrompts } from "./prompt";
import { getRelevantMemory, saveMessage } from "../chroma/memory";
import { addMessage, markImportant } from "../db/message.server";

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

  try {
    const extraction = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0,
      messages: [
        {
          role: "system",
          content:
            'Extract the minimal actionable data from the user\'s message as strict JSON. If it is a request that should be carried forward (e.g., rescheduling, cancellations, changes), return a compact JSON with fields: action (string, lowercase verb), params (object), summary (short string). If not actionable, return {"action":"none","params":{},"summary":""}. Do not include any extra text.',
        },
        { role: "user", content: query },
      ],
      response_format: { type: "json_object" as any },
      max_tokens: 200,
    });

    const raw = extraction.choices[0]?.message?.content || "";
    const parsed = JSON.parse(raw || "{}");
    if (parsed && parsed.action && parsed.action !== "none") {
      await markImportant(parsed.summary || query, {
        action: parsed.action,
        params: parsed.params || {},
        source: "extracted",
      });
    }
  } catch (err) {
    console.error("extraction_failed", err);
  }

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

export const summarizeText = async (text: string): Promise<string> => {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "Summarize the following text concisely while preserving key information:",
        },
        {
          role: "user",
          content: text,
        },
      ],
      max_tokens: 150,
      temperature: 0.3,
    });

    return response.choices[0]?.message?.content || text;
  } catch (error) {
    console.error("Failed to summarize text:", error);
    return text;
  }
};
