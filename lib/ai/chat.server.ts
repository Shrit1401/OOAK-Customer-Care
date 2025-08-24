"use server";

import axios from "axios";
import { systemPrompts } from "./prompt";
import { getRelevantMemory, saveMessage } from "../chroma/memory";
import { addMessage, markImportant } from "../db/message.server";
import { getContext } from "../chroma/context";

const OLLAMA_URL = "http://localhost:11434";
const OLLAMA_MODEL = "gpt-oss:20b";

export const generateOpenAIText = async (query: string, phoneNumber: string) => {
  const relevantMemory = await getRelevantMemory(query, phoneNumber, 10);
  const relevantContext = await getContext(10, phoneNumber)

  const response = await axios.post(`${OLLAMA_URL}/api/chat`, {
    model: OLLAMA_MODEL,
    temperature: 0.7,
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
        role: "system",
        content: `These are some context for you. ${relevantContext}`
      },
      {
        role: "system",
        content: "https://www.ooak.photography/ this is our website and this is our https://www.instagram.com/ooak.photography",
      },
      {
        role: "user",
        content: query,
      }
    ],
    stream: false,
  });

  await saveMessage(phoneNumber, query, {
    tokens: query.length,
    tags: ["user-input", "question"],
  });
  await addMessage(query, "USER", phoneNumber);

  let action = "none";
  let params = {};
  let summary = "";
  try {
    const extraction = await axios.post(`${OLLAMA_URL}/api/chat`, {
      model: OLLAMA_MODEL,
      temperature: 0,
      messages: [
        {
          role: "system",
          content:
            'You must respond with ONLY valid JSON. Extract the minimal actionable data from the user\'s message. If it is a request that should be carried forward (e.g., rescheduling, cancellations, changes), return: {"action":"verb","params":{},"summary":"text"}. If not actionable, return: {"action":"none","params":{},"summary":""}. No other text, only JSON.',
        },
        { role: "user", content: query },
      ],
      stream: false,
      max_tokens: 200,
    });

    const raw =
      extraction.data?.message?.content ??
      extraction.data?.response ??
      extraction.data?.choices?.[0]?.message?.content ??
      "";
    
    // Clean the response to extract only JSON
    let jsonString = raw.trim();
    // Remove any text before the first {
    const firstBrace = jsonString.indexOf('{');
    if (firstBrace > 0) {
      jsonString = jsonString.substring(firstBrace);
    }
    // Remove any text after the last }
    const lastBrace = jsonString.lastIndexOf('}');
    if (lastBrace > 0 && lastBrace < jsonString.length - 1) {
      jsonString = jsonString.substring(0, lastBrace + 1);
    }
    
    const parsed = JSON.parse(jsonString || "{}");
    if (parsed && parsed.action) {
      action = parsed.action;
      params = parsed.params || {};
      summary = parsed.summary || "";
      if (action !== "none") {
        await markImportant(summary || query, phoneNumber, {
          action,
          params,
          source: "extracted",
        });
      }
    }
  } catch (err) {
    console.error("extraction_failed", err);
    // Continue with default values if extraction fails
  }

  const aiResponse =
    response.data?.message?.content ??
    response.data?.response ??
    response.data?.choices?.[0]?.message?.content ??
    "";

  if (aiResponse) {
    await saveMessage("ai", aiResponse, {
      tokens: aiResponse.length,
      tags: ["ai-response", "generated"],
    });
    await addMessage(aiResponse, "ASSISTANT", phoneNumber);
  }

  return {
    query,
    ai: aiResponse,
    action,
    params,
    summary,
  };
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
      max_tokens: 150,
      temperature: 0.3,
    });

    return response.data?.message?.content ??
           response.data?.response ??
           response.data?.choices?.[0]?.message?.content ??
           text;
  } catch (error) {
    console.error("Failed to summarize text:", error);
    return text;
  }
};
