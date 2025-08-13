"use client";
import BottomChatBar from "@/components/BottomChatBar";
import { generateOpenAIText } from "@/lib/ai/chat.server";
import React, { useState } from "react";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const HomePage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello I am Ooak, can I know you're query?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);

  const addMessage = (content: string, isUser: boolean) => {
    const newMessage: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content,
      isUser,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  };

  const updateMessage = (id: string, content: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, content } : msg))
    );
  };

  const handleSendMessage = async (message: string, model: string) => {
    addMessage(message, true);

    try {
      const aiMessage = addMessage("", false);
      console.log("Starting AI response generation...");
      const stream = await generateOpenAIText(message);

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log("Stream completed");
          break;
        }

        const chunk = decoder.decode(value);
        console.log("Received chunk:", chunk);
        accumulatedContent += chunk;
        updateMessage(aiMessage.id, accumulatedContent);
      }
    } catch (error) {
      console.error("Error generating AI response:", error);
      addMessage(
        "Sorry, I encountered an error while processing your request. Please try again.",
        false
      );
    }
  };

  return (
    <div className="min-h-screen text-gray-200">
      <div className="max-w-4xl mx-auto pt-4 pb-32 mb-16">
        <div className="space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.isUser ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.isUser ? "bg-[#373737] text-white" : "text-gray-200"
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomChatBar onSendMessage={handleSendMessage} />
    </div>
  );
};

export default HomePage;
