import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth";
import { uploadFotoSoal, StorageError } from "@/lib/storage/supabase-storage";

export const dynamic = "force-dynamic";

/**
 * POST /api/bantuan-pr/upload  (multipart/form-data, field: "foto")
 * Mengunggah foto soal ke Supabase Storage privat, dibatasi ke folder pengguna.
 * Mengembalikan path objek untuk disimpan di homework_sessions.foto_url.
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

    const form = await req.formData().catch(() => null);
    const foto = form?.get("foto");
    if (!(foto instanceof File)) {
      return NextResponse.json(
        { error: "Field 'foto' (file) wajib diunggah." },
        { status: 422 },
      );
    }

    const { path } = await uploadFotoSoal(foto, userId);
    return NextResponse.json({ data: { path } }, { status: 201 });
  } catch (err) {
    if (err instanceof StorageError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("POST /api/bantuan-pr/upload gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengunggah foto." },
      { status: 500 },
    );
  }
}
