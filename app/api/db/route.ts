import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

// One route handles all collections. Client holds the full array and PUTs it back.
// Simple + robust for a small family dataset (last-write-wins).

const COLS = ["readings", "family", "reminders", "config"] as const;
type Col = (typeof COLS)[number];
const keyFor = (c: string) => `bp:${c}`;

type Member = { email: string; name: string; isAdmin?: boolean };

const norm = (e?: string | null) => (e || "").trim().toLowerCase();

async function getFamily(): Promise<Member[]> {
  return ((await redis.get(keyFor("family"))) as Member[]) || [];
}

export async function GET(req: NextRequest) {
  const col = req.nextUrl.searchParams.get("col") as Col;
  if (!COLS.includes(col))
    return NextResponse.json({ error: "bad col" }, { status: 400 });

  const email = norm(req.headers.get("x-user-email"));
  const family = await getFamily();
  const member = family.some((m) => m.email === email);
  const isAdmin = family.some((m) => m.email === email && m.isAdmin);

  // family is the "login check" endpoint — always answerable
  if (col === "family") {
    return NextResponse.json({
      setup: family.length === 0,
      member,
      isAdmin,
      list: member ? family : [],
    });
  }

  if (!member) return NextResponse.json({ error: "not allowed" }, { status: 403 });
  const data = (await redis.get(keyFor(col))) || [];
  return NextResponse.json({ data });
}

export async function PUT(req: NextRequest) {
  const col = req.nextUrl.searchParams.get("col") as Col;
  if (!COLS.includes(col))
    return NextResponse.json({ error: "bad col" }, { status: 400 });

  const email = norm(req.headers.get("x-user-email"));
  const body = await req.json();
  const family = await getFamily();
  const member = family.some((m) => m.email === email);
  const isAdmin = family.some((m) => m.email === email && m.isAdmin);

  if (col === "family") {
    // Bootstrap: if no family yet, the first writer sets it up (and is admin).
    if (family.length === 0) {
      await redis.set(keyFor("family"), body.data);
      return NextResponse.json({ ok: true });
    }
    if (!isAdmin)
      return NextResponse.json({ error: "admin only" }, { status: 403 });
    await redis.set(keyFor("family"), body.data);
    return NextResponse.json({ ok: true });
  }

  if (!member) return NextResponse.json({ error: "not allowed" }, { status: 403 });
  await redis.set(keyFor(col), body.data);
  return NextResponse.json({ ok: true });
}
