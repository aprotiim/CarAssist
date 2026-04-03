import { streamText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { RAG_CONTENT } from "@/lib/constants";

const SYSTEM_PROMPT = `You are CarAssist, an expert AI assistant helping first-time and experienced used car buyers in the USA make smart, confident purchasing decisions.

You have deep knowledge of the used car buying process. Here is your knowledge base:

${Object.entries(RAG_CONTENT)
  .map(([key, content]) => `## ${key.toUpperCase()}\n${content}`)
  .join("\n\n")}

Guidelines:
- Be concise, practical, and friendly. Lead with the most actionable advice.
- Use the knowledge base above to answer questions accurately.
- When relevant, recommend getting an independent pre-purchase inspection.
- Warn about common scams and red flags proactively.
- Format responses clearly — use bullet points or numbered lists for checklists.
- Never recommend specific dealerships or endorse specific products.
- If asked something outside used car buying, politely redirect to your area of expertise.
- Keep responses under 400 words unless the user asks for more detail.`;

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages array required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const anthropic = createAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const result = await streamText({
      model: anthropic("claude-sonnet-4-6"),
      system: SYSTEM_PROMPT,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      maxTokens: 1024,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to get response from Claude" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
