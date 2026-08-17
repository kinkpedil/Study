import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth";
import { getJawabanAkhir, BantuanError } from "@/server/bantuan-pr";

export const dynamic = "force-dynamic";

/**
 * GET /api/bantuan-pr/:sessionId/jawaban
 * Mengambil jawaban akhir sesi — aksi eksplisit "minta jawaban akhir".
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Tidak terautentikasi." },
        { status: 401 },
      );
    }
    const { sessionId } = await params;
    const jawaban = await getJawabanAkhir(sessionId, userId);
    return NextResponse.json({ data: { jawaban } });
  } catch (err) {
    if (err instanceof BantuanError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("GET /api/bantuan-pr/:id/jawaban gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil jawaban." },
      { status: 500 },
    );
  }
}
