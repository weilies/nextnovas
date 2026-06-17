import { NextResponse } from "next/server";

export async function GET() {
  const names = Object.keys(process.env).filter(
    (k) => k.includes("BLOB") || k.startsWith("KV_") || k === "RESEND_API_KEY" || k === "RESEND_FROM"
  );
  const out: Record<string, any> = {};
  for (const n of names) {
    const v = process.env[n];
    out[n] = { present: !!v, length: v ? v.length : 0, prefix: v ? v.slice(0, 8) : null };
  }
  return NextResponse.json({ keys: names, detail: out });
}
