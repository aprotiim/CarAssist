import { NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  const backendRes = await fetch(`${BACKEND}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  }).catch(() => null);

  if (!backendRes || !backendRes.ok) {
    const detail = await backendRes?.json().catch(() => ({}));
    return NextResponse.json(
      { error: detail?.detail || "Registration failed" },
      { status: backendRes?.status || 500 }
    );
  }

  const user = await backendRes.json();

  const response = NextResponse.json({ ok: true, user });
  response.cookies.set("cargenuity_auth", String(user.id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
