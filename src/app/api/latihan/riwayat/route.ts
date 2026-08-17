import { NextResponse } from "next/server";

import { getCurrentUserId } from "@/lib/auth";
import { getRiwayatStatistik } from "@/server/riwayat";

export const dynamic = "force-dynamic";

/**
 * GET /api/latihan/riwayat
 * Riwayat latihan + statistik progres (ringkasan, per mapel, dan seri untuk
 * grafik) milik pengguna yang login.
 */
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Tidak terautentikasi." },
        { status: 401 },
      );
    }

    const data = await getRiwayatStatistik(userId);
    return NextResponse.json({ data });
  } catch (err) {
    console.error("GET /api/latihan/riwayat gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil riwayat." },
      { status: 500 },
    );
  }
}
