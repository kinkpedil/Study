import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth";
import { hapusKoleksi } from "@/server/perpustakaan";

export const dynamic = "force-dynamic";

/**
 * DELETE /api/perpustakaan/koleksi/:bookId — hapus buku dari koleksi pengguna.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ bookId: string }> },
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Tidak terautentikasi." },
        { status: 401 },
      );
    }
    const { bookId } = await params;
    const dihapus = await hapusKoleksi(userId, bookId);
    if (!dihapus) {
      return NextResponse.json(
        { error: "Buku tidak ada di koleksi." },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/perpustakaan/koleksi/:bookId gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menghapus dari koleksi." },
      { status: 500 },
    );
  }
}
