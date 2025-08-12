"use client";
import BottomChatBar from "@/components/BottomChatBar";
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
      content: "Hello! I'm your AI assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);

  const addMessage = (content: string, isUser: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleSendMessage = (message: string, model: string) => {
    addMessage(message, true);

    setTimeout(() => {
      const responses = [
        "That's an interesting question! Let me think about that...",
        "I understand what you're asking. Here's what I can tell you...",
        "Great question! Based on my knowledge, I'd say...",
        "I'm processing your request. Here's my response...",
        "Thanks for asking! Here's what I found...",
      ];
      const randomResponse =
        responses[Math.floor(Math.random() * responses.length)];
      addMessage(randomResponse, false);
    }, 1000);
  };

  return (
    <div className="min-h-screen text-gray-200">
      <div className="max-w-4xl mx-auto pt-4 pb-32">
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
