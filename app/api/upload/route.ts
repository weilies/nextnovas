import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getSessionEmail } from "@/lib/session";
import { redis } from "@/lib/redis";

const norm = (e?: string | null) => (e || "").trim().toLowerCase();

// Server upload (Vercel limit ~4.5MB per file — fine for report photos/PDFs).
export async function POST(req: Request) {
  const email = norm(await getSessionEmail());
  if (!email) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  // Only family members can upload.
  const family = ((await redis.get("bp:family")) as { email: string }[]) || [];
  if (!family.some((m) => m.email === email)) {
    return NextResponse.json({ error: "not allowed" }, { status: 403 });
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "no file" }, { status: 400 });

  const okTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/heic"];
  if (file.type && !okTypes.includes(file.type)) {
    return NextResponse.json({ error: "bad type" }, { status: 415 });
  }
  if (file.size > 4.4 * 1024 * 1024) {
    return NextResponse.json({ error: "too_large" }, { status: 413 });
  }

  const safeName = (file.name || "report").replace(/[^\w.\-]/g, "_");
  const blob = await put(`reports/${safeName}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  return NextResponse.json({ url: blob.url, pathname: blob.pathname, contentType: file.type, size: file.size });
}
