import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { laporIndikasiBerbahaya, EskalasiError } from "@/server/eskalasi-tutor";

export const dynamic = "force-dynamic";

/**
 * POST /api/tutor/:sessionId/laporan
 * Melaporkan indikasi berbahaya pada sesi tutor. Kategori diambil server-side
 * dari pesan yang ditandai filter keselamatan; guru/admin sekolah dinotifikasi.
 */
export async function POST(
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

    const rl = await rateLimit(`tutor:laporan:${userId}`, 10, 3600);
    if (!rl.allowed) return tooManyRequests(rl.retryAfter);

    const { sessionId } = await params;
    const data = await laporIndikasiBerbahaya(sessionId, userId);
    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    if (err instanceof EskalasiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("POST /api/tutor/:id/laporan gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat melaporkan indikasi." },
      { status: 500 },
    );
  }
}
