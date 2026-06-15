import { NextResponse } from "next/server";

// TEMPORARY debug endpoint — reveals only whether each var is set (true/false)
// and a harmless length/prefix, never the actual secret values.
// Remove this file once auth is confirmed working.
export async function GET() {
  const vars = [
    "AUTH_SECRET", "AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET", "AUTH_URL",
    "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET",
    "KV_REST_API_URL", "KV_REST_API_TOKEN",
  ];
  const out: Record<string, any> = {};
  for (const v of vars) {
    const val = process.env[v];
    out[v] = {
      present: typeof val !== "undefined" && val !== "",
      length: val ? val.length : 0,
      prefix: val ? val.slice(0, 6) : null,
    };
  }
  out["VERCEL_ENV"] = process.env.VERCEL_ENV || null;
  out["VERCEL"] = process.env.VERCEL || null;
  return NextResponse.json(out);
}
