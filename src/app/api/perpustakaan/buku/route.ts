import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth";
import { cariBuku } from "@/server/perpustakaan";

export const dynamic = "force-dynamic";

const JENJANG = new Set(["SD", "SMP", "SMA"]);

/**
 * GET /api/perpustakaan/buku?q=&jenjang=&mapel=&kategori=&limit=&offset=
 * Pencarian & filter katalog buku untuk pengguna yang login.
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

    const sp = req.nextUrl.searchParams;
    const jenjangRaw = sp.get("jenjang") ?? undefined;
    const jenjang =
      jenjangRaw && JENJANG.has(jenjangRaw)
        ? (jenjangRaw as "SD" | "SMP" | "SMA")
        : undefined;

    const limit = Number(sp.get("limit")) || undefined;
    const offset = Number(sp.get("offset")) || undefined;

    const hasil = await cariBuku({
      q: sp.get("q") ?? undefined,
      jenjang,
      mapel: sp.get("mapel") ?? undefined,
      kategoriSlug: sp.get("kategori") ?? undefined,
      limit,
      offset,
    });

    return NextResponse.json(hasil);
  } catch (err) {
    console.error("GET /api/perpustakaan/buku gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mencari buku." },
      { status: 500 },
    );
  }
}
