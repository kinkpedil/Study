import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getCurrentProfile } from "@/lib/auth";
import { createAssignment, TugasError } from "@/server/tugas";
import { createTugasSchema } from "@/lib/validation/tugas";

export const dynamic = "force-dynamic";

/**
 * POST /api/tugas — buat & kirim tugas ke kelas (guru pemilik kelas).
 */
export async function POST(req: NextRequest) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json(
        { error: "Tidak terautentikasi atau profil belum dibuat." },
        { status: 401 },
      );
    }
    const body = await req.json().catch(() => null);
    const parsed = createTugasSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid.", issues: z.treeifyError(parsed.error) },
        { status: 422 },
      );
    }
    const hasil = await createAssignment(profile, parsed.data);
    return NextResponse.json({ data: hasil }, { status: 201 });
  } catch (err) {
    if (err instanceof TugasError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("POST /api/tugas gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat membuat tugas." },
      { status: 500 },
    );
  }
}
