import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getCurrentProfile } from "@/lib/auth";
import { laporkanKonten, ModerasiError } from "@/server/moderasi";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const schema = z.object({
  targetType: z.enum(["thread", "post"]),
  targetId: z.string().uuid(),
  reason: z.enum([
    "kasar",
    "sara",
    "perundungan",
    "spam",
    "doxxing",
    "berbahaya",
    "lainnya",
  ]),
});

/** POST /api/forum/laporan — laporkan konten forum. */
export async function POST(req: NextRequest) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json(
        { error: "Tidak terautentikasi atau profil belum dibuat." },
        { status: 401 },
      );
    }
    // Rate limit: maks 20 laporan / menit per pengguna.
    const rl = await rateLimit(`forum:laporan:${profile.id}`, 20, 60);
    if (!rl.allowed) return tooManyRequests(rl.retryAfter);

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data laporan tidak valid." },
        { status: 422 },
      );
    }
    const hasil = await laporkanKonten(profile, parsed.data);
    return NextResponse.json({ data: hasil }, { status: 201 });
  } catch (err) {
    if (err instanceof ModerasiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("POST /api/forum/laporan gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat melaporkan." },
      { status: 500 },
    );
  }
}
