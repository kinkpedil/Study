import { NextResponse, type NextRequest } from "next/server";

import { getCurrentProfile } from "@/lib/auth";
import { listPengumpulan, TugasError } from "@/server/tugas";

export const dynamic = "force-dynamic";

/** GET /api/tugas/:id/pengumpulan — daftar pengumpulan untuk dinilai (guru). */
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
    const data = await listPengumpulan(profile, id);
    return NextResponse.json({ data });
  } catch (err) {
    if (err instanceof TugasError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("GET /api/tugas/:id/pengumpulan gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memuat pengumpulan." },
      { status: 500 },
    );
  }
}
