import { NextResponse, type NextRequest } from "next/server";

import { getCurrentProfile } from "@/lib/auth";
import {
  tandaiEskalasiDitangani,
  EskalasiError,
} from "@/server/eskalasi-tutor";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/tutor/eskalasi/:id
 * Guru/admin menandai eskalasi sekolahnya sebagai ditangani.
 */
export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const profil = await getCurrentProfile();
    const { id } = await params;
    await tandaiEskalasiDitangani(id, profil);
    return NextResponse.json({ data: { id, status: "ditangani" } });
  } catch (err) {
    if (err instanceof EskalasiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("PATCH /api/tutor/eskalasi/:id gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memperbarui eskalasi." },
      { status: 500 },
    );
  }
}
