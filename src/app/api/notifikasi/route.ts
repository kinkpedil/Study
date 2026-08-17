import { NextResponse } from "next/server";

import { getCurrentUserId } from "@/lib/auth";
import { listNotifikasi, tandaiSemuaDibaca } from "@/server/notifikasi";

export const dynamic = "force-dynamic";

/**
 * GET /api/notifikasi
 * Daftar notifikasi pengguna yang login + jumlah belum dibaca.
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

    const hasil = await listNotifikasi(userId);
    return NextResponse.json(hasil);
  } catch (err) {
    console.error("GET /api/notifikasi gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil notifikasi." },
      { status: 500 },
    );
  }
}

/**
 * POST /api/notifikasi/baca-semua di-handle di sub-route. Endpoint PATCH ini
 * menandai SEMUA notifikasi pengguna sebagai dibaca.
 */
export async function PATCH() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Tidak terautentikasi." },
        { status: 401 },
      );
    }

    const jumlah = await tandaiSemuaDibaca(userId);
    return NextResponse.json({ updated: jumlah });
  } catch (err) {
    console.error("PATCH /api/notifikasi gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memperbarui notifikasi." },
      { status: 500 },
    );
  }
}
