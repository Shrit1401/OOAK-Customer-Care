import { NextRequest } from "next/server";
import { generateOpenAIText } from "@/lib/ai/chat.server";

export async function POST(req: NextRequest) {
  try {
    const { message, userId } = await req.json();

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "'message' is required and must be a string" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const effectiveUserId =
      typeof userId === "string" && userId.trim() ? userId : `user-${Date.now()}`;

    const result = await generateOpenAIText(message, effectiveUserId);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("/api/chat error", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate AI response" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}