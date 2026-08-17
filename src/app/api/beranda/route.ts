import { NextResponse } from "next/server";

import { getCurrentProfile } from "@/lib/auth";
import { getBerandaData } from "@/server/beranda";

export const dynamic = "force-dynamic";

/**
 * GET /api/beranda
 * Data Beranda yang sudah disaring sesuai peran pengguna (siswa/guru/admin).
 * 401 bila belum login; 404 bila profil belum dibuat.
 */
export async function GET() {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json(
        { error: "Tidak terautentikasi atau profil belum dibuat." },
        { status: 401 },
      );
    }

    const data = await getBerandaData(profile);
    return NextResponse.json({ data });
  } catch (err) {
    console.error("GET /api/beranda gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data Beranda." },
      { status: 500 },
    );
  }
}
