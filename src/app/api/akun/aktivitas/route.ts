import { NextResponse, type NextRequest } from "next/server";

import { getCurrentProfile } from "@/lib/auth";
import { listAudit, AuditError, type AuditKategori } from "@/server/audit";

export const dynamic = "force-dynamic";

const kategoriValid: AuditKategori[] = [
  "pengguna",
  "moderasi",
  "forum",
  "keamanan",
  "sistem",
];

/**
 * GET /api/akun/aktivitas?kategori=... — catatan aktivitas untuk admin,
 * di-scope ke sekolahnya; opsional disaring per kategori.
 */
export async function GET(req: NextRequest) {
  try {
    const profil = await getCurrentProfile();
    const param = req.nextUrl.searchParams.get("kategori");
    const kategori =
      param && kategoriValid.includes(param as AuditKategori)
        ? (param as AuditKategori)
        : undefined;

    const data = await listAudit(profil, kategori);
    return NextResponse.json({ data });
  } catch (err) {
    if (err instanceof AuditError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("GET /api/akun/aktivitas gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memuat catatan aktivitas." },
      { status: 500 },
    );
  }
}
