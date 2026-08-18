import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getCurrentUserId } from "@/lib/auth";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { buatSesiTutorSchema } from "@/lib/validation/tutor";
import { buatSesiTutor, listSesiTutor } from "@/server/tutor";

export const dynamic = "force-dynamic";

/**
 * GET /api/tutor — daftar sesi Tutor AI milik pengguna (terbaru dulu).
 */
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Tidak terautentikasi." },
        { status: 401 },
      );
    }
    const data = await listSesiTutor(userId);
    return NextResponse.json({ data });
  } catch (err) {
    console.error("GET /api/tutor gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil sesi." },
      { status: 500 },
    );
  }
}

/**
 * POST /api/tutor — membuka sesi Tutor AI baru.
 * Body: { mapel, jenjang?, judul?, pertanyaan? }
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Tidak terautentikasi." },
        { status: 401 },
      );
    }

    const rl = await rateLimit(`tutor:sesi:${userId}`, 20, 3600);
    if (!rl.allowed) return tooManyRequests(rl.retryAfter);

    const body = await req.json().catch(() => null);
    const parsed = buatSesiTutorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid.", issues: z.treeifyError(parsed.error) },
        { status: 422 },
      );
    }

    const sesi = await buatSesiTutor(parsed.data, userId);
    return NextResponse.json({ data: sesi }, { status: 201 });
  } catch (err) {
    console.error("POST /api/tutor gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat membuka sesi." },
      { status: 500 },
    );
  }
}
