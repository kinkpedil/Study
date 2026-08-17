import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getCurrentUserId } from "@/lib/auth";
import { petunjukSchema } from "@/lib/validation/bantuan-pr";
import { bukaSesiBantuan } from "@/server/bantuan-pr";
import { AIError } from "@/lib/ai/provider";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/bantuan-pr
 * Mengirim pertanyaan (teks, opsional path foto dari /api/bantuan-pr/upload)
 * dan membuka sesi: AI menyusun petunjuk bertahap, sesi & pesan disimpan.
 * Body: { pertanyaan, mapel, jenjang, jumlah?, fotoUrl? }
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
    const parsed = petunjukSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid.", issues: z.treeifyError(parsed.error) },
        { status: 422 },
      );
    }

    const hasil = await bukaSesiBantuan(parsed.data, userId);
    return NextResponse.json({ data: hasil }, { status: 201 });
  } catch (err) {
    if (err instanceof AIError) {
      return NextResponse.json(
        { error: "Gagal menyusun petunjuk dari AI.", detail: err.message },
        { status: 502 },
      );
    }
    console.error("POST /api/bantuan-pr gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat membuka sesi bantuan." },
      { status: 500 },
    );
  }
}
