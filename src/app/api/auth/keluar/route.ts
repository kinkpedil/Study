import { NextResponse } from "next/server";

import { keluarPengguna } from "@/server/auth-akun";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/keluar — mengeluarkan pengguna (menghapus sesi cookie).
 */
export async function POST() {
  try {
    await keluarPengguna();
    return NextResponse.json({ data: { ok: true } });
  } catch (err) {
    console.error("POST /api/auth/keluar gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat keluar." },
      { status: 500 },
    );
  }
}
