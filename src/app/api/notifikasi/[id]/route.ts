import { NextResponse } from "next/server";

import { getCurrentUserId } from "@/lib/auth";
import { tandaiDibaca } from "@/server/notifikasi";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/notifikasi/:id
 * Menandai satu notifikasi milik pengguna sebagai dibaca.
 */
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Tidak terautentikasi." },
        { status: 401 },
      );
    }

    const { id } = await params;
    const ok = await tandaiDibaca(userId, id);
    if (!ok) {
      return NextResponse.json(
        { error: "Notifikasi tidak ditemukan atau sudah dibaca." },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/notifikasi/:id gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memperbarui notifikasi." },
      { status: 500 },
    );
  }
}
