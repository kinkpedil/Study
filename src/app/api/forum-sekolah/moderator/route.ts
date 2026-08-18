import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getCurrentProfile } from "@/lib/auth";
import {
  listModerator,
  angkatModerator,
  ForumSekolahError,
} from "@/server/forum-sekolah";

export const dynamic = "force-dynamic";

const schema = z.object({ profileId: z.string().uuid() });

/** GET /api/forum-sekolah/moderator — daftar moderator (admin sekolah). */
export async function GET() {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json(
        { error: "Tidak terautentikasi atau profil belum dibuat." },
        { status: 401 },
      );
    }
    const data = await listModerator(profile);
    return NextResponse.json({ data });
  } catch (err) {
    if (err instanceof ForumSekolahError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("GET /api/forum-sekolah/moderator gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memuat moderator." },
      { status: 500 },
    );
  }
}

/** POST /api/forum-sekolah/moderator — angkat moderator (admin). */
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
        { error: "profileId tidak valid." },
        { status: 422 },
      );
    }
    await angkatModerator(profile, parsed.data.profileId);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    if (err instanceof ForumSekolahError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("POST /api/forum-sekolah/moderator gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengangkat moderator." },
      { status: 500 },
    );
  }
}
