"use client";

import type { Message } from "ai";
import { Weather } from "@/app/components/weather";

export default function Message({ message }: { message: Message }) {
  return (
    <div
      className={`flex gap-5 p-4 ${
        message.role === "assistant" ? "bg-gray-900 rounded-lg" : ""
      }`}
    >
      <div className="text-sm text-gray-500">
        {message.role === "user" ? "U" : "A"}
      </div>
      <div className="text-sm">{message.content}</div>

      {message.toolInvocations?.map((tool) => {
        const { toolName, toolCallId, state } = tool;

        if (state === "result") {
          if (toolName === "getWeather") {
            return <Weather key={toolCallId} toolCallId {...tool.result} />;
          }
        } else {
          if (toolName === "getWeather") {
            return <div key={toolCallId}>Loading weather data...</div>;
          }
        }
      })}
    </div>
  );
}