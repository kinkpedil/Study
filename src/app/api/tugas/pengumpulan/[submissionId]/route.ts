import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getCurrentProfile } from "@/lib/auth";
import { nilaiPengumpulan, TugasError } from "@/server/tugas";
import { gradeTugasSchema } from "@/lib/validation/tugas";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/tugas/pengumpulan/:submissionId — beri nilai & komentar (guru).
 * Body: { grade, feedback? }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> },
) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json(
        { error: "Tidak terautentikasi atau profil belum dibuat." },
        { status: 401 },
      );
    }
    const { submissionId } = await params;
    const body = await req.json().catch(() => null);
    const parsed = gradeTugasSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid.", issues: z.treeifyError(parsed.error) },
        { status: 422 },
      );
    }

    await nilaiPengumpulan(profile, submissionId, parsed.data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof TugasError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("PATCH /api/tugas/pengumpulan/:id gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menilai." },
      { status: 500 },
    );
  }
}
