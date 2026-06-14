import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { auth } from "@/auth";

// Identity now comes from the verified Google session — NOT a spoofable header.
const COLS = ["readings", "family", "reminders", "config"] as const;
type Col = (typeof COLS)[number];
const keyFor = (c: string) => `bp:${c}`;
type Member = { email: string; name: string; isAdmin?: boolean };
const norm = (e?: string | null) => (e || "").trim().toLowerCase();

async function getFamily(): Promise<Member[]> {
  return ((await redis.get(keyFor("family"))) as Member[]) || [];
}

export async function GET(req: Request) {
  const col = new URL(req.url).searchParams.get("col") as Col;
  if (!COLS.includes(col)) return NextResponse.json({ error: "bad col" }, { status: 400 });

  const session = await auth();
  const email = norm(session?.user?.email);
  if (!email) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const family = await getFamily();
  const member = family.some((m) => m.email === email);
  const isAdmin = family.some((m) => m.email === email && m.isAdmin);

  if (col === "family") {
    return NextResponse.json({
      setup: family.length === 0,
      member,
      isAdmin,
      list: member ? family : [],
      me: { email, name: session?.user?.name || email },
    });
  }

  if (!member) return NextResponse.json({ error: "not allowed" }, { status: 403 });
  const data = (await redis.get(keyFor(col))) || [];
  return NextResponse.json({ data });
}

export async function PUT(req: Request) {
  const col = new URL(req.url).searchParams.get("col") as Col;
  if (!COLS.includes(col)) return NextResponse.json({ error: "bad col" }, { status: 400 });

  const session = await auth();
  const email = norm(session?.user?.email);
  if (!email) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = await req.json();
  const family = await getFamily();
  const member = family.some((m) => m.email === email);
  const isAdmin = family.some((m) => m.email === email && m.isAdmin);

  if (col === "family") {
    if (family.length === 0) {
      await redis.set(keyFor("family"), body.data);
      return NextResponse.json({ ok: true });
    }
    if (!isAdmin) return NextResponse.json({ error: "admin only" }, { status: 403 });
    await redis.set(keyFor("family"), body.data);
    return NextResponse.json({ ok: true });
  }

  if (!member) return NextResponse.json({ error: "not allowed" }, { status: 403 });
  await redis.set(keyFor(col), body.data);
  return NextResponse.json({ ok: true });
}
