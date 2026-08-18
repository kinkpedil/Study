import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getCurrentProfile } from "@/lib/auth";
import { buatPengumuman, ForumSekolahError } from "@/server/forum-sekolah";

export const dynamic = "force-dynamic";

const schema = z.object({
  title: z.string().trim().min(5).max(200),
  body: z.string().trim().min(10).max(5000),
});

/**
 * POST /api/forum-sekolah/pengumuman — buat pengumuman (admin sekolah).
 */
export async function POST(req: NextRequest) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json(
        { error: "Tidak terautentikasi atau profil belum dibuat." },
        { status: 401 },
      );
    }
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid.", issues: z.treeifyError(parsed.error) },
        { status: 422 },
      );
    }

    const hasil = await buatPengumuman(profile, parsed.data);
    return NextResponse.json({ data: hasil }, { status: 201 });
  } catch (err) {
    if (err instanceof ForumSekolahError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("POST /api/forum-sekolah/pengumuman gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat membuat pengumuman." },
      { status: 500 },
    );
  }
}
