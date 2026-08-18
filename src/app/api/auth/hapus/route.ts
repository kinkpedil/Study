import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getCurrentUserId } from "@/lib/auth";
import { hapusAkun, AuthError } from "@/server/auth-akun";

export const dynamic = "force-dynamic";

// Konfirmasi wajib (selaras dengan dialog di UI).
const hapusSchema = z.object({
  konfirmasi: z.literal("HAPUS"),
});

/**
 * POST /api/auth/hapus — menghapus akun pengguna sendiri secara permanen.
 * Body: { konfirmasi: "HAPUS" }. Mencascade data milik pengguna & menghapus
 * pengguna Auth, lalu mengakhiri sesi.
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const parsed = hapusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Konfirmasi tidak valid. Ketik HAPUS untuk mengonfirmasi." },
        { status: 422 },
      );
    }

    await hapusAkun(userId);
    return NextResponse.json({ data: { ok: true } });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("POST /api/auth/hapus gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menghapus akun." },
      { status: 500 },
    );
  }
}
