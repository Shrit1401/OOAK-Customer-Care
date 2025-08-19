"use client";
import React, { useState } from "react";
import { useSidebar } from "@/components/ui/sidebar";

interface BottomChatBarProps {
  onSendMessage?: (message: string) => void;
  isLoading?: boolean;
}

const BottomChatBar = ({
  onSendMessage,
  isLoading = false,
}: BottomChatBarProps) => {
  const [message, setMessage] = useState("");
  const { state, isMobile } = useSidebar();

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log("Sending message:", message, "with model:");
      onSendMessage?.(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 p-4 transition-all duration-300 ${
        state === "expanded" && !isMobile ? "ml-64" : ""
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-3 bg-[#222222] rounded-2xl px-4 py-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Send a message"
            disabled={isLoading}
            className="flex-1 bg-transparent text-gray-200 placeholder-gray-400 outline-none resize-none min-h-[60px] disabled:opacity-50 disabled:cursor-not-allowed"
          />

          <div className="flex items-center justify-end">
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading}
              className="bg-white text-black hover:bg-gray-200 disabled:bg-[#373737] disabled:text-white disabled:cursor-not-allowed p-2 rounded-full transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M8.99992 16V6.41407L5.70696 9.70704C5.31643 10.0976 4.68342 10.0976 4.29289 9.70704C3.90237 9.31652 3.90237 8.6835 4.29289 8.29298L9.29289 3.29298L9.36907 3.22462C9.76184 2.90427 10.3408 2.92686 10.707 3.29298L15.707 8.29298L15.7753 8.36915C16.0957 8.76192 16.0731 9.34092 15.707 9.70704C15.3408 10.0732 14.7618 10.0958 14.3691 9.7754L14.2929 9.70704L10.9999 6.41407V16C10.9999 16.5523 10.5522 17 9.99992 17C9.44764 17 8.99992 16.5523 8.99992 16Z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomChatBar;
