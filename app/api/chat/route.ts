import { NextRequest } from "next/server";
import { generateOpenAIText } from "@/lib/ai/chat.server";

// Helper function to validate phone number format
function validatePhoneNumber(phoneNumber: string): boolean {
  return /^\d{10}$/.test(phoneNumber);
}

export async function POST(req: NextRequest) {
  try {
    const { message, phoneNumber } = await req.json();

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "'message' is required and must be a string" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!phoneNumber || typeof phoneNumber !== "string") {
      return new Response(
        JSON.stringify({ error: "'phoneNumber' is required and must be a string" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate phone number format
    if (!validatePhoneNumber(phoneNumber)) {
      return new Response(
        JSON.stringify({ error: "Phone number must be exactly 10 digits" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await generateOpenAIText(message, phoneNumber);
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