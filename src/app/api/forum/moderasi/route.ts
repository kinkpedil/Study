import { NextResponse, type NextRequest } from "next/server";

import { getCurrentProfile } from "@/lib/auth";
import { listLaporan, ModerasiError } from "@/server/moderasi";

export const dynamic = "force-dynamic";

/**
 * GET /api/forum/moderasi?status=menunggu — antrean laporan untuk moderator.
 */
export async function GET(req: NextRequest) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json(
        { error: "Tidak terautentikasi atau profil belum dibuat." },
        { status: 401 },
      );
    }
    const hanyaMenunggu =
      req.nextUrl.searchParams.get("status") === "menunggu";
    const data = await listLaporan(profile, hanyaMenunggu);
    return NextResponse.json({ data });
  } catch (err) {
    if (err instanceof ModerasiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("GET /api/forum/moderasi gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memuat laporan." },
      { status: 500 },
    );
  }
}
