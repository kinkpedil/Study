import { NextResponse, type NextRequest } from "next/server";

import { getCurrentProfile } from "@/lib/auth";
import { listThreads } from "@/server/forum";

export const dynamic = "force-dynamic";

/**
 * GET /api/forum/threads?scope=jenjang|umum&category=
 * Daftar topik forum yang boleh diakses pengguna (berjenjang). Butuh login.
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

    const sp = req.nextUrl.searchParams;
    const scopeRaw = sp.get("scope");
    const scope =
      scopeRaw === "jenjang" || scopeRaw === "umum" ? scopeRaw : undefined;

    const data = await listThreads(profile, {
      scope,
      category: sp.get("category") ?? undefined,
    });
    return NextResponse.json({ data });
  } catch (err) {
    console.error("GET /api/forum/threads gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil forum." },
      { status: 500 },
    );
  }
}
