import { NextRequest } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q");
  const history = searchParams.get("history");

  if (!q) {
    return new Response(JSON.stringify({ error: "q parameter required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const params = new URLSearchParams({ q });
  if (history) params.set("history", history);

  const backendRes = await fetch(`${BACKEND}/api/chat/stream?${params}`, {
    headers: { Accept: "text/event-stream" },
  }).catch(() => null);

  if (!backendRes || !backendRes.ok) {
    return new Response(JSON.stringify({ error: "Stream unavailable" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(backendRes.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
