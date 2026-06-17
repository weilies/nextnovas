import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getSessionEmail } from "@/lib/session";
import { redis } from "@/lib/redis";

export const runtime = "nodejs";

const norm = (e?: string | null) => (e || "").trim().toLowerCase();

// Private store: relies on OIDC (BLOB_STORE_ID + VERCEL_OIDC_TOKEN) auto-injected
// when the store is connected to the project. Files are NOT publicly accessible;
// they are streamed back through /api/report-file after a session check.
export async function POST(req: Request) {
  const email = norm(await getSessionEmail());
  if (!email) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const family = ((await redis.get("bp:family")) as { email: string }[]) || [];
  if (!family.some((m) => m.email === email)) {
    return NextResponse.json({ error: "not allowed" }, { status: 403 });
  }

  let file: File | null = null;
  try {
    const form = await req.formData();
    file = form.get("file") as File | null;
  } catch (e: any) {
    return NextResponse.json({ error: "form_parse", detail: String(e?.message || e) }, { status: 400 });
  }
  if (!file) return NextResponse.json({ error: "no file" }, { status: 400 });
  if (file.size > 4.4 * 1024 * 1024) {
    return NextResponse.json({ error: "too_large" }, { status: 413 });
  }

  const safeName = (file.name || "report").replace(/[^\w.\-]/g, "_");
  const contentType = file.type || "application/octet-stream";

  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const blob = await put(`reports/${Date.now()}-${safeName}`, buf, {
      access: "private",
      addRandomSuffix: true,
      contentType,
    });
    return NextResponse.json({ url: blob.url, pathname: blob.pathname, contentType, size: file.size });
  } catch (e: any) {
    return NextResponse.json({ error: "blob_failed", detail: String(e?.message || e) }, { status: 500 });
  }
}
