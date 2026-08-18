import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getCurrentProfile } from "@/lib/auth";
import {
  listPengaduan,
  buatPengaduan,
  ForumSekolahError,
} from "@/server/forum-sekolah";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const schema = z.object({
  title: z.string().trim().min(5).max(200),
  description: z.string().trim().min(10).max(5000),
  visibility: z.enum(["privat", "publik"]).default("privat"),
});

/** GET /api/forum-sekolah/pengaduan — daftar pengaduan yang boleh dilihat. */
export async function GET() {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json(
        { error: "Tidak terautentikasi atau profil belum dibuat." },
        { status: 401 },
      );
    }
    const data = await listPengaduan(profile);
    return NextResponse.json({ data });
  } catch (err) {
    console.error("GET /api/forum-sekolah/pengaduan gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memuat pengaduan." },
      { status: 500 },
    );
  }
}

/** POST /api/forum-sekolah/pengaduan — ajukan masalah baru. */
export async function POST(req: NextRequest) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json(
        { error: "Tidak terautentikasi atau profil belum dibuat." },
        { status: 401 },
      );
    }
    // Rate limit: maks 5 pengaduan / 5 menit per pengguna.
    const rl = await rateLimit(`forum:pengaduan:${profile.id}`, 5, 300);
    if (!rl.allowed) return tooManyRequests(rl.retryAfter);

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid.", issues: z.treeifyError(parsed.error) },
        { status: 422 },
      );
    }
    const hasil = await buatPengaduan(profile, parsed.data);
    return NextResponse.json({ data: hasil }, { status: 201 });
  } catch (err) {
    if (err instanceof ForumSekolahError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("POST /api/forum-sekolah/pengaduan gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengirim pengaduan." },
      { status: 500 },
    );
  }
}
