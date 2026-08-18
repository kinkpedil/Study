import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getCurrentProfile } from "@/lib/auth";
import { submitTugas, TugasError } from "@/server/tugas";
import { submitTugasSchema } from "@/lib/validation/tugas";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * POST /api/tugas/:id/submit — kumpulkan jawaban (siswa anggota kelas).
 * Body: { content?, fileUrl? }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json(
        { error: "Tidak terautentikasi atau profil belum dibuat." },
        { status: 401 },
      );
    }

    const rl = await rateLimit(`tugas:submit:${profile.id}`, 20, 60);
    if (!rl.allowed) return tooManyRequests(rl.retryAfter);

    const { id } = await params;
    const body = await req.json().catch(() => null);
    const parsed = submitTugasSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid.", issues: z.treeifyError(parsed.error) },
        { status: 422 },
      );
    }

    const hasil = await submitTugas(profile, id, parsed.data);
    return NextResponse.json({ data: hasil }, { status: 201 });
  } catch (err) {
    if (err instanceof TugasError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("POST /api/tugas/:id/submit gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengumpulkan jawaban." },
      { status: 500 },
    );
  }
}
