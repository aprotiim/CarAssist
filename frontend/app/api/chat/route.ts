/**
 * Chat API route — proxies to the FastAPI backend streaming endpoint.
 * Converts backend SSE format ({"token":"..."}) to Vercel AI SDK data stream
 * format so the useChat hook works without any frontend changes.
 */

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Extract last user message + conversation history
    const lastUser = [...messages].reverse().find(
      (m: { role: string }) => m.role === "user"
    );
    if (!lastUser) {
      return new Response(JSON.stringify({ error: "No user message" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const history = messages.slice(0, -1);

    // Call the FastAPI streaming endpoint (LangGraph + Pinecone RAG)
    const params = new URLSearchParams({
      q: lastUser.content,
      history: JSON.stringify(history),
    });

    const backendRes = await fetch(`${BACKEND}/api/chat/stream?${params}`, {
      headers: { Accept: "text/event-stream" },
    }).catch(() => null);

    if (!backendRes || !backendRes.ok) {
      // Fallback: call non-streaming endpoint
      const fallback = await fetch(`${BACKEND}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      }).catch(() => null);

      const reply = fallback?.ok
        ? (await fallback.json()).reply
        : "I'm having trouble connecting. Please try again.";

      return buildDataStreamResponse(reply);
    }

    // Stream: convert backend SSE → Vercel AI SDK data stream
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = backendRes.body!.getReader();
        let buffer = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const data = line.slice(6).trim();

              if (data === "[DONE]") {
                controller.enqueue(
                  encoder.encode(
                    `d:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":0}}\n`
                  )
                );
                controller.close();
                return;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.token) {
                  controller.enqueue(
                    encoder.encode(`0:${JSON.stringify(parsed.token)}\n`)
                  );
                }
              } catch {
                // skip malformed lines
              }
            }
          }
        } catch {
          controller.close();
        } finally {
          reader.releaseLock();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "x-vercel-ai-data-stream": "v1",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Chat service unavailable" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

/** Wrap a plain string as a minimal Vercel AI SDK data stream response. */
function buildDataStreamResponse(text: string): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`0:${JSON.stringify(text)}\n`));
      controller.enqueue(
        encoder.encode(
          `d:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":0}}\n`
        )
      );
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "x-vercel-ai-data-stream": "v1",
    },
  });
}
