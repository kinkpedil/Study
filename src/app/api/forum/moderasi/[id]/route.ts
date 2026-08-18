import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getCurrentProfile } from "@/lib/auth";
import { tinjauLaporan, ModerasiError } from "@/server/moderasi";

export const dynamic = "force-dynamic";

const schema = z.object({ aksi: z.enum(["hapus", "tolak"]) });

/**
 * PATCH /api/forum/moderasi/:id — tinjau laporan (moderator).
 * Body: { aksi: "hapus" | "tolak" }
 */
export async function PATCH(
  req: NextRequest,
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
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Aksi tidak valid (hapus/tolak)." },
        { status: 422 },
      );
    }
    await tinjauLaporan(profile, id, parsed.data.aksi);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ModerasiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("PATCH /api/forum/moderasi/:id gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat meninjau laporan." },
      { status: 500 },
    );
  }
}
