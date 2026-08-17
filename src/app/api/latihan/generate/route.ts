import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getCurrentUserId } from "@/lib/auth";
import { generateLatihanSchema } from "@/lib/validation/latihan";
import { generateLatihan } from "@/server/generate-soal";
import { AIError } from "@/lib/ai/provider";

export const dynamic = "force-dynamic";
// Generasi AI bisa memakan waktu; beri ruang lebih.
export const maxDuration = 60;

/**
 * POST /api/latihan/generate
 * Membuat paket latihan dari parameter menggunakan AI (OpenRouter, server-side).
 * Body: { jenjang, kelas, mapel, topik?, kesulitan, tipe, jumlah }
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

    const body = await req.json().catch(() => null);
    const parsed = generateLatihanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Parameter tidak valid.",
          issues: z.treeifyError(parsed.error),
        },
        { status: 422 },
      );
    }

    const hasil = await generateLatihan(parsed.data, userId);
    return NextResponse.json({ data: hasil }, { status: 201 });
  } catch (err) {
    if (err instanceof AIError) {
      return NextResponse.json(
        { error: "Gagal membuat soal dari AI.", detail: err.message },
        { status: 502 },
      );
    }
    console.error("POST /api/latihan/generate gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat membuat latihan." },
      { status: 500 },
    );
  }
}
