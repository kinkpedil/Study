import { NextResponse } from "next/server";

import { getRekomendasiUntukSaya } from "@/server/rekomendasi-tutor";

export const dynamic = "force-dynamic";

/**
 * GET /api/tutor/rekomendasi
 * Rekomendasi materi/latihan personal berdasarkan progres belajar siswa.
 */
export async function GET() {
  try {
    const data = await getRekomendasiUntukSaya();
    if (data === null) {
      return NextResponse.json(
        { error: "Tidak terautentikasi." },
        { status: 401 },
      );
    }
    return NextResponse.json({ data });
  } catch (err) {
    console.error("GET /api/tutor/rekomendasi gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menyusun rekomendasi." },
      { status: 500 },
    );
  }
}
