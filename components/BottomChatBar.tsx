"use client";
import React, { useState } from "react";
import { useSidebar } from "@/components/ui/sidebar";

interface BottomChatBarProps {
  onSendMessage?: (message: string, model: string) => void;
}

const BottomChatBar = ({ onSendMessage }: BottomChatBarProps) => {
  const [message, setMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemma3:1b");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { state, isMobile } = useSidebar();

  const models = ["gemma3:1b", "gemma3:2b", "gemma3:7b", "gemma3:14b"];

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log("Sending message:", message, "with model:", selectedModel);
      onSendMessage?.(message.trim(), selectedModel);
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
            className="flex-1 bg-transparent text-gray-200 placeholder-gray-400 outline-none resize-none min-h-[60px]"
          />

          <div className="flex items-center justify-between">
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 cursor-pointer bg-[#373737] hover:bg-[#3e3e3e] px-3 py-1.5 rounded-2xl text-gray-300 text-sm transition-colors"
              >
                <span>{selectedModel}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute bottom-full cursor-pointer left-0 mb-2 bg-[#373737] rounded-md shadow-lg min-w-[120px]">
                  {models.map((model) => (
                    <button
                      key={model}
                      onClick={() => {
                        setSelectedModel(model);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-[#3e3e3e] transition-colors ${
                        selectedModel === model ? "text-white" : "text-gray-300"
                      }`}
                    >
                      {model}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="bg-white text-black hover:bg-gray-200 disabled:bg-[#373737] disabled:text-white disabled:cursor-not-allowed p-2 rounded-full transition-colors"
            >
              <svg
                className="w-5 h-5 "
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomChatBar;
