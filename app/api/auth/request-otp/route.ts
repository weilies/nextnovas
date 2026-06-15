import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

const norm = (e: string) => e.trim().toLowerCase();
const isEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// Simple per-email rate limit: at most 1 send per 30s.
const COOLDOWN_SECONDS = 30;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = norm(body.email || "");
  if (!isEmail(email)) return NextResponse.json({ error: "invalid email" }, { status: 400 });

  // Check family allowlist (first-ever user bootstraps as admin in verify step)
  const family = ((await redis.get("bp:family")) as { email: string }[]) || [];
  const isFirstUser = family.length === 0;
  const allowed = isFirstUser || family.some((m) => m.email === email);
  if (!allowed) {
    // Don't reveal whether the email exists or not in detail, but it's a small family app —
    // a clear message is more helpful than security-by-obscurity here.
    return NextResponse.json({ error: "not_allowed" }, { status: 403 });
  }

  const cooldownKey = `bp:otp:cooldown:${email}`;
  if (await redis.get(cooldownKey)) {
    return NextResponse.json({ error: "cooldown" }, { status: 429 });
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  await redis.set(`bp:otp:${email}`, code, { ex: 300 }); // 5 minutes
  await redis.set(cooldownKey, "1", { ex: COOLDOWN_SECONDS });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "email_not_configured" }, { status: 500 });

  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || "妈妈健康记录 <noreply@nextnovas.com>",
      to: [email],
      subject: `验证码 ${code} - 妈妈血压心率记录`,
      html: `<div style="font-family:sans-serif;font-size:16px;color:#1f2937">
        <p>您的登录验证码是：</p>
        <p style="font-size:32px;font-weight:bold;letter-spacing:4px;color:#0f766e">${code}</p>
        <p style="color:#6b7280;font-size:13px">5 分钟内有效。如果不是您本人请求，请忽略此邮件。</p>
      </div>`,
    }),
  });

  if (!resp.ok) {
    const t = await resp.text();
    console.error("[otp] resend error", resp.status, t);
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
