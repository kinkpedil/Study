import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { masukSchema } from "@/lib/validation/auth";
import { masukPengguna, AuthError } from "@/server/auth-akun";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/masuk — memasukkan pengguna (email + kata sandi).
 * Menulis sesi ke cookie. Body: { email, password }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = masukSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid.", issues: z.treeifyError(parsed.error) },
        { status: 422 },
      );
    }

    // Batasi percobaan masuk per email (anti brute-force).
    const rl = await rateLimit(
      `auth:masuk:${parsed.data.email.toLowerCase()}`,
      10,
      900,
    );
    if (!rl.allowed) return tooManyRequests(rl.retryAfter);

    const data = await masukPengguna(parsed.data);
    return NextResponse.json({ data });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("POST /api/auth/masuk gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat masuk." },
      { status: 500 },
    );
  }
}
