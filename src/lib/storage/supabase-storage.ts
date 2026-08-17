import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Penyimpanan foto soal Bantuan PR di Supabase Storage. File disimpan di bucket
 * privat `bantuan-pr` dengan struktur `{userId}/{uuid}.{ext}` sehingga RLS
 * Storage bisa membatasi akses ke pemiliknya (lihat migrasi 0004).
 */

export const BANTUAN_PR_BUCKET = "bantuan-pr";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp"]);

export class StorageError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "StorageError";
  }
}

function extFromType(type: string): string {
  switch (type) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "jpg";
  }
}

/**
 * Mengunggah foto soal milik pengguna. Mengembalikan path objek di bucket.
 * Divalidasi tipe & ukuran lebih dulu.
 */
export async function uploadFotoSoal(
  file: File,
  userId: string,
): Promise<{ path: string }> {
  if (!ALLOWED.has(file.type)) {
    throw new StorageError("Format harus PNG, JPG, atau WEBP.", 415);
  }
  if (file.size > MAX_SIZE) {
    throw new StorageError("Ukuran file melebihi 5 MB.", 413);
  }

  const supabase = await createSupabaseServerClient();
  const path = `${userId}/${crypto.randomUUID()}.${extFromType(file.type)}`;

  const { error } = await supabase.storage
    .from(BANTUAN_PR_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    throw new StorageError(`Gagal mengunggah: ${error.message}`, 502);
  }
  return { path };
}

/** Membuat URL bertanda-tangan (sementara) untuk melihat foto privat. */
export async function getSignedFotoUrl(
  path: string,
  expiresIn = 3600,
): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.storage
    .from(BANTUAN_PR_BUCKET)
    .createSignedUrl(path, expiresIn);
  if (error) return null;
  return data?.signedUrl ?? null;
}
