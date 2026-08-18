import { NextResponse } from "next/server";

import { getCurrentProfile } from "@/lib/auth";
import { getStatusPrivasi } from "@/server/privasi-anak";

export const dynamic = "force-dynamic";

/**
 * GET /api/akun/privasi — status privasi pengguna: apakah akun anak, izin
 * pemrosesan data, dan status persetujuan wali.
 */
export async function GET() {
  try {
    const profil = await getCurrentProfile();
    if (!profil) {
      return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
    }
    const data = await getStatusPrivasi(profil);
    return NextResponse.json({ data });
  } catch (err) {
    console.error("GET /api/akun/privasi gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memuat status privasi." },
      { status: 500 },
    );
  }
}
