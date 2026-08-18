import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { daftarSchema } from "@/lib/validation/auth";
import { daftarPengguna, AuthError } from "@/server/auth-akun";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/daftar — mendaftarkan pengguna baru (Supabase Auth + profil).
 * Body: { nama, email, password, role, sekolah, jenjang?, kelas? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = daftarSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid.", issues: z.treeifyError(parsed.error) },
        { status: 422 },
      );
    }

    // Batasi pendaftaran per email untuk mencegah penyalahgunaan.
    const rl = await rateLimit(
      `auth:daftar:${parsed.data.email.toLowerCase()}`,
      5,
      3600,
    );
    if (!rl.allowed) return tooManyRequests(rl.retryAfter);

    const data = await daftarPengguna(parsed.data);
    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("POST /api/auth/daftar gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mendaftar." },
      { status: 500 },
    );
  }
}
