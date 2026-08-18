import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getCurrentUserId } from "@/lib/auth";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { pesanTutorSchema } from "@/lib/validation/tutor";
import { getSesiTutor, kirimPesanTutor, TutorError } from "@/server/tutor";
import { PrivasiError } from "@/server/privasi-anak";
import { AIError } from "@/lib/ai/provider";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GET /api/tutor/:sessionId — detail sesi + seluruh pesannya.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Tidak terautentikasi." },
        { status: 401 },
      );
    }
    const { sessionId } = await params;
    const data = await getSesiTutor(sessionId, userId);
    return NextResponse.json({ data });
  } catch (err) {
    if (err instanceof TutorError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("GET /api/tutor/:id gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memuat sesi." },
      { status: 500 },
    );
  }
}

/**
 * POST /api/tutor/:sessionId — siswa mengirim pesan; tutor AI membalas.
 * Body: { isi }. Mengembalikan pesan siswa dan balasan tutor.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Tidak terautentikasi." },
        { status: 401 },
      );
    }

    const rl = await rateLimit(`tutor:pesan:${userId}`, 60, 3600);
    if (!rl.allowed) return tooManyRequests(rl.retryAfter);

    const { sessionId } = await params;
    const body = await req.json().catch(() => null);
    const parsed = pesanTutorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid.", issues: z.treeifyError(parsed.error) },
        { status: 422 },
      );
    }

    const data = await kirimPesanTutor(sessionId, userId, parsed.data.isi);
    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    if (err instanceof TutorError || err instanceof PrivasiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    if (err instanceof AIError) {
      return NextResponse.json(
        { error: "Gagal mendapat balasan tutor AI.", detail: err.message },
        { status: 502 },
      );
    }
    console.error("POST /api/tutor/:id gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengirim pesan." },
      { status: 500 },
    );
  }
}
