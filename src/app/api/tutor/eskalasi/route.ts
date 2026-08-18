import { NextResponse } from "next/server";

import { getCurrentProfile } from "@/lib/auth";
import { listEskalasiGuru, EskalasiError } from "@/server/eskalasi-tutor";

export const dynamic = "force-dynamic";

/**
 * GET /api/tutor/eskalasi
 * Antrean eskalasi tutor untuk guru/admin, di-scope ke sekolahnya.
 */
export async function GET() {
  try {
    const profil = await getCurrentProfile();
    const data = await listEskalasiGuru(profil);
    return NextResponse.json({ data });
  } catch (err) {
    if (err instanceof EskalasiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("GET /api/tutor/eskalasi gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memuat eskalasi." },
      { status: 500 },
    );
  }
}
