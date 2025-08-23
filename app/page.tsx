"use client";
import BottomChatBar from "@/components/BottomChatBar";
import LoadingIndicator from "@/components/LoadingIndicator";
import React, { useState } from "react";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const HomePage = () => {
  const [phone, setPhone] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello I am Ooak, can I know you're query?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = (content: string, isUser: boolean) => {
    const newMessage: Message = {
      id: `${phone}_${Date.now()}`,
      content,
      isUser,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  };

  const handleSendMessage = async (message: string) => {
    if (!phone || phone.length !== 10) {
      addMessage(
        "Please enter a valid 10-digit phone number before sending a message.",
        false
      );
      return;
    }

    addMessage(message, true);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, phoneNumber: phone }),
      });
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const aiResponse = await response.json();
      addMessage(aiResponse.ai || "", false);
      setIsLoading(false);
    } catch (error) {
      console.error("Error generating AI response:", error);
      addMessage(
        "Sorry, I encountered an error while processing your request. Please try again.",
        false
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-gray-200">
      <div className="fixed bg-[#222222] p-4 bottom-0 right-0 mb-3 mr-3 rounded-xl z-50">
        <label htmlFor="phone-input" className="block text-gray-200 mb-2">
          Enter your phone number:
        </label>
        <input
          id="phone-input"
          type="tel"
          placeholder="e.g. 123-456-7890"
          className="rounded-lg px-3 py-2 bg-[#373737] text-white placeholder-gray-400 outline-none w-full min-h-[44px] text-base touch-manipulation"
          autoComplete="tel"
          inputMode="numeric"
          maxLength={10}
          value={phone}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            setPhone(value.slice(0, 10));
          }}
        />
      </div>
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
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl px-4 py-3 text-gray-200">
                <LoadingIndicator />
              </div>
            </div>
          )}
        </div>
      </div>
      <BottomChatBar onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default HomePage;
