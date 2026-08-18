import { NextResponse } from "next/server";

import { getCurrentProfile } from "@/lib/auth";
import { getForumSekolah } from "@/server/forum-sekolah";

export const dynamic = "force-dynamic";

/**
 * GET /api/forum-sekolah — ruang forum sekolah pengguna + pengumumannya.
 */
export async function GET() {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json(
        { error: "Tidak terautentikasi atau profil belum dibuat." },
        { status: 401 },
      );
    }
    const data = await getForumSekolah(profile);
    return NextResponse.json({ data });
  } catch (err) {
    console.error("GET /api/forum-sekolah gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memuat forum sekolah." },
      { status: 500 },
    );
  }
}
