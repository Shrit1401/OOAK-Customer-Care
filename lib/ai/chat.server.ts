"use server";

import axios from "axios";
import { systemPrompts } from "./prompt";
import { getRelevantMemory, saveMessage } from "../chroma/memory";
import { addMessage, markImportant } from "../db/message.server";

const OLLAMA_URL = "http://localhost:11434";
const OLLAMA_MODEL = "gpt-oss:20b";

export const generateOpenAIText = async (query: string, userId: string) => {
  const relevantMemory = await getRelevantMemory(query, 10);

  const response = await axios.post(`${OLLAMA_URL}/api/chat`, {
    model: OLLAMA_MODEL,
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
    stream: false,
  });

  await saveMessage(userId, query, {
    tokens: query.length,
    tags: ["user-input", "question"],
  });

  await addMessage(query, "USER");

  try {
    const extraction = await axios.post(`${OLLAMA_URL}/api/chat`, {
      model: OLLAMA_MODEL,
      temperature: 0,
      messages: [
        {
          role: "system",
          content:
            'Extract the minimal actionable data from the user\'s message as strict JSON. If it is a request that should be carried forward (e.g., rescheduling, cancellations, changes), return a compact JSON with fields: action (string, lowercase verb), params (object), summary (short string). If not actionable, return {"action":"none","params":{},"summary":""}. Do not include any extra text.',
        },
        { role: "user", content: query },
      ],
      format: "json",
      stream: false,
    });

    console.log(extraction.data);

    const raw = extraction.data?.message?.content || "";
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
  console.log(response.data);
  const aiResponse = response.data?.message?.content || "";

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
    const response = await axios.post(`${OLLAMA_URL}/api/chat`, {
      model: OLLAMA_MODEL,
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
      temperature: 0.3,
      stream: false,
    });

    console.log(response.data);

    return response.data?.message?.content || text;
  } catch (error) {
    console.error("Failed to summarize text:", error);
    return text;
  }
};
