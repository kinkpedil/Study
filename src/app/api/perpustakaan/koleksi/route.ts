import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getCurrentUserId } from "@/lib/auth";
import { listKoleksi, tambahKoleksi, KoleksiError } from "@/server/perpustakaan";

export const dynamic = "force-dynamic";

const tambahSchema = z.object({ bookId: z.string().uuid() });

/** GET /api/perpustakaan/koleksi — daftar koleksi tersimpan pengguna. */
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Tidak terautentikasi." },
        { status: 401 },
      );
    }
    const data = await listKoleksi(userId);
    return NextResponse.json({ data });
  } catch (err) {
    console.error("GET /api/perpustakaan/koleksi gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil koleksi." },
      { status: 500 },
    );
  }
}

/** POST /api/perpustakaan/koleksi — simpan buku ke koleksi. Body: { bookId }. */
export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Tidak terautentikasi." },
        { status: 401 },
      );
    }
    const body = await req.json().catch(() => null);
    const parsed = tambahSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "bookId tidak valid." },
        { status: 422 },
      );
    }
    await tambahKoleksi(userId, parsed.data.bookId);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    if (err instanceof KoleksiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("POST /api/perpustakaan/koleksi gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menyimpan buku." },
      { status: 500 },
    );
  }
}
