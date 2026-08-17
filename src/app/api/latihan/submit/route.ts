import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getCurrentUserId } from "@/lib/auth";
import { submitLatihanSchema } from "@/lib/validation/latihan";
import { submitLatihan, SubmitError } from "@/server/submit-latihan";

export const dynamic = "force-dynamic";

/**
 * POST /api/latihan/submit
 * Mengirim jawaban latihan, menilai pilihan ganda, dan menyimpan hasil.
 * Body: { exerciseSetId, jawaban: [{ questionId, jawaban }] }
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
    const parsed = submitLatihanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid.", issues: z.treeifyError(parsed.error) },
        { status: 422 },
      );
    }

    const hasil = await submitLatihan(parsed.data, userId);
    return NextResponse.json({ data: hasil }, { status: 201 });
  } catch (err) {
    if (err instanceof SubmitError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("POST /api/latihan/submit gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengirim jawaban." },
      { status: 500 },
    );
  }
}
