import { NextResponse } from "next/server";

import { getCurrentUserId } from "@/lib/auth";
import { getRingkasanProgres } from "@/server/progres";

// Selalu dinamis: bergantung pada sesi pengguna.
export const dynamic = "force-dynamic";

/**
 * GET /api/progres
 * Mengembalikan ringkasan progres belajar pengguna yang sedang login.
 * 401 bila belum login.
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

    const ringkasan = await getRingkasanProgres(userId);
    return NextResponse.json({ data: ringkasan });
  } catch (err) {
    console.error("GET /api/progres gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil ringkasan progres." },
      { status: 500 },
    );
  }
}
