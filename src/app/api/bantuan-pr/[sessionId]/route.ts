import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getCurrentUserId } from "@/lib/auth";
import {
  getSesiBantuan,
  mintaPetunjukBerikutnya,
  BantuanError,
} from "@/server/bantuan-pr";
import { AIError } from "@/lib/ai/provider";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const lanjutSchema = z.object({
  tindakLanjut: z.string().trim().min(1).max(1000),
});

/**
 * GET /api/bantuan-pr/:sessionId
 * Detail sesi + pesan (petunjuk & langkah). Jawaban akhir disembunyikan —
 * diminta terpisah lewat /jawaban.
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
    const data = await getSesiBantuan(sessionId, userId);
    return NextResponse.json({ data });
  } catch (err) {
    if (err instanceof BantuanError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("GET /api/bantuan-pr/:id gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memuat sesi." },
      { status: 500 },
    );
  }
}

/**
 * POST /api/bantuan-pr/:sessionId  — minta petunjuk berikutnya (tindak lanjut).
 * Body: { tindakLanjut }
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
    const { sessionId } = await params;
    const body = await req.json().catch(() => null);
    const parsed = lanjutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid.", issues: z.treeifyError(parsed.error) },
        { status: 422 },
      );
    }

    const pesan = await mintaPetunjukBerikutnya(
      sessionId,
      userId,
      parsed.data.tindakLanjut,
    );
    return NextResponse.json({ data: pesan }, { status: 201 });
  } catch (err) {
    if (err instanceof BantuanError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    if (err instanceof AIError) {
      return NextResponse.json(
        { error: "Gagal menyusun petunjuk dari AI.", detail: err.message },
        { status: 502 },
      );
    }
    console.error("POST /api/bantuan-pr/:id gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat meminta petunjuk." },
      { status: 500 },
    );
  }
}
