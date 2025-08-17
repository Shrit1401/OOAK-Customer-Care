"use client";
import React from "react";

const LoadingIndicator = () => {
  return (
    <div className="flex items-center space-x-2 text-gray-400">
      <div className="w-2 h-2 bg-[#373737] rounded-full animate-bounce"></div>
      <div
        className="w-2 h-2 bg-[#373737] rounded-full animate-bounce"
        style={{ animationDelay: "0.1s" }}
      ></div>
      <div
        className="w-2 h-2 bg-[#373737] rounded-full animate-bounce"
        style={{ animationDelay: "0.2s" }}
      ></div>
    </div>
  );
};

export default LoadingIndicator;
