import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE = "bp_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return s;
}

function sign(value: string) {
  const h = crypto.createHmac("sha256", secret()).update(value).digest("base64url");
  return `${value}.${h}`;
}

function verify(token: string): string | null {
  const idx = token.lastIndexOf(".");
  if (idx < 0) return null;
  const value = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = crypto.createHmac("sha256", secret()).update(value).digest("base64url");
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  return value;
}

/** Set the session cookie for a verified email. */
export async function setSession(email: string) {
  const payload = JSON.stringify({ email, t: Date.now() });
  const token = sign(Buffer.from(payload).toString("base64url"));
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

/** Read the current session's email, or null if absent/invalid. */
export async function getSessionEmail(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const value = verify(token);
  if (!value) return null;
  try {
    const { email, t } = JSON.parse(Buffer.from(value, "base64url").toString());
    if (Date.now() - t > MAX_AGE * 1000) return null;
    return typeof email === "string" ? email : null;
  } catch {
    return null;
  }
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
