import { get } from "@vercel/blob";
import { getSessionEmail } from "@/lib/session";
import { redis } from "@/lib/redis";

export const runtime = "nodejs";

const norm = (e?: string | null) => (e || "").trim().toLowerCase();

// Streams a private blob back to the browser, but only for logged-in family
// members, and only if the requested URL is one we actually stored in bp:reports.
export async function GET(req: Request) {
  const email = norm(await getSessionEmail());
  if (!email) return new Response("unauthenticated", { status: 401 });

  const family = ((await redis.get("bp:family")) as { email: string }[]) || [];
  if (!family.some((m) => m.email === email)) {
    return new Response("not allowed", { status: 403 });
  }

  const u = new URL(req.url).searchParams.get("u") || "";
  if (!u) return new Response("missing url", { status: 400 });

  // Only allow URLs that exist in our stored reports list (prevents arbitrary fetch).
  const reports = ((await redis.get("bp:reports")) as { url: string }[]) || [];
  if (!reports.some((r) => r.url === u)) {
    return new Response("unknown file", { status: 404 });
  }

  try {
    const result = await get(u, { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) {
      return new Response("not found", { status: 404 });
    }
    const ct = result.blob.contentType || "application/octet-stream";
    return new Response(result.stream, {
      status: 200,
      headers: {
        "Content-Type": ct,
        "Content-Disposition": "inline",
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch (e: any) {
    return new Response("error: " + String(e?.message || e), { status: 500 });
  }
}
