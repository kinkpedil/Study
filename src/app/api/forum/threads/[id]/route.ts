import { NextResponse, type NextRequest } from "next/server";

import { getCurrentProfile } from "@/lib/auth";
import { getThreadDetail, ForumError } from "@/server/forum";

export const dynamic = "force-dynamic";

/**
 * GET /api/forum/threads/:id — detail topik + balasan (akses berjenjang).
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json(
        { error: "Tidak terautentikasi atau profil belum dibuat." },
        { status: 401 },
      );
    }
    const { id } = await params;
    const data = await getThreadDetail(profile, id);
    return NextResponse.json({ data });
  } catch (err) {
    if (err instanceof ForumError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("GET /api/forum/threads/:id gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memuat topik." },
      { status: 500 },
    );
  }
}
