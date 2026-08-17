import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth";
import { searchGlobal } from "@/server/pencarian";

export const dynamic = "force-dynamic";

/**
 * GET /api/pencarian?q=...
 * Pencarian global lintas konten & diskusi untuk pengguna yang login.
 * Hasil dibatasi sesuai jenjang siswa (untuk diskusi).
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Tidak terautentikasi." },
        { status: 401 },
      );
    }

    const q = req.nextUrl.searchParams.get("q") ?? "";
    const hasil = await searchGlobal(q, { profileId: userId });
    return NextResponse.json(hasil);
  } catch (err) {
    console.error("GET /api/pencarian gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat melakukan pencarian." },
      { status: 500 },
    );
  }
}
