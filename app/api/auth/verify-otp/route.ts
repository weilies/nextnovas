import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { setSession } from "@/lib/session";

const norm = (e: string) => e.trim().toLowerCase();

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = norm(body.email || "");
  const code = String(body.code || "").trim();
  if (!email || !code) return NextResponse.json({ error: "missing" }, { status: 400 });

  const key = `bp:otp:${email}`;
  const stored = await redis.get(key);
  if (!stored || String(stored) !== code) {
    return NextResponse.json({ error: "invalid_code" }, { status: 401 });
  }
  await redis.del(key);

  await setSession(email);
  return NextResponse.json({ ok: true });
}
