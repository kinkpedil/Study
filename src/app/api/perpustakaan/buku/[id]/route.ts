import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth";
import { getDetailBuku } from "@/server/perpustakaan";

export const dynamic = "force-dynamic";

/**
 * GET /api/perpustakaan/buku/:id
 * Detail buku + status tersimpan untuk pengguna yang login. 404 bila tak ada.
 */
export async function GET(
  _req: NextRequest,
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
    const buku = await getDetailBuku(id, userId);
    if (!buku) {
      return NextResponse.json(
        { error: "Buku tidak ditemukan." },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: buku });
  } catch (err) {
    console.error("GET /api/perpustakaan/buku/:id gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil detail buku." },
      { status: 500 },
    );
  }
}
