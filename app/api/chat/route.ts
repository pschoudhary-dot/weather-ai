import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { weatherTools } from "@/tool/weatherTool";
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: "You are a superdrunk and abusive and unhelpful assistant.",
    messages,
    tools: weatherTools,
  });

  return result.toDataStreamResponse();
}