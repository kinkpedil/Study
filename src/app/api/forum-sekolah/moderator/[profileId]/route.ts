import { NextResponse, type NextRequest } from "next/server";

import { getCurrentProfile } from "@/lib/auth";
import { cabutModerator, ForumSekolahError } from "@/server/forum-sekolah";

export const dynamic = "force-dynamic";

/** DELETE /api/forum-sekolah/moderator/:profileId — cabut moderator (admin). */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ profileId: string }> },
) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json(
        { error: "Tidak terautentikasi atau profil belum dibuat." },
        { status: 401 },
      );
    }
    const { profileId } = await params;
    const dihapus = await cabutModerator(profile, profileId);
    if (!dihapus) {
      return NextResponse.json(
        { error: "Moderator tidak ditemukan." },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ForumSekolahError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("DELETE /api/forum-sekolah/moderator/:id gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mencabut moderator." },
      { status: 500 },
    );
  }
}
