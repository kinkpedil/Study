import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getCurrentProfile } from "@/lib/auth";
import {
  ubahStatusPengaduan,
  ForumSekolahError,
} from "@/server/forum-sekolah";

export const dynamic = "force-dynamic";

const schema = z.object({
  status: z.enum(["baru", "diproses", "selesai"]),
  resolutionNote: z.string().trim().max(2000).optional(),
});

/**
 * PATCH /api/forum-sekolah/pengaduan/:id — perbarui status/tindak lanjut
 * (admin sekolah).
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
        { error: "Data tidak valid.", issues: z.treeifyError(parsed.error) },
        { status: 422 },
      );
    }

    await ubahStatusPengaduan(profile, id, parsed.data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ForumSekolahError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("PATCH /api/forum-sekolah/pengaduan/:id gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memperbarui pengaduan." },
      { status: 500 },
    );
  }
}
