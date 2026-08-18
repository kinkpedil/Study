import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { profiles, schools, type Profile } from "@/db/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { siapkanPrivasiAnak } from "@/server/privasi-anak";
import type { DaftarInput, MasukInput } from "@/lib/validation/auth";

/**
 * Layanan autentikasi akun: pendaftaran & masuk lewat Supabase Auth. Sesi
 * ditulis ke cookie oleh klien server. Baris `profiles` dibuat lewat koneksi
 * server (db) sehingga profil ada bahkan sebelum verifikasi email. Kata sandi
 * dikelola Supabase — tidak pernah disimpan aplikasi.
 */

export class AuthError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

/** Cari sekolah berdasarkan nama (case-insensitive), buat bila belum ada. */
async function pastikanSekolah(nama: string): Promise<string> {
  const [ada] = await db
    .select({ id: schools.id })
    .from(schools)
    .where(eq(schools.name, nama))
    .limit(1);
  if (ada) return ada.id;
  const [row] = await db
    .insert(schools)
    .values({ name: nama })
    .returning({ id: schools.id });
  return row.id;
}

export interface HasilDaftar {
  profile: Profile;
  /** true bila sesi langsung aktif; false bila perlu verifikasi email dulu. */
  sesiAktif: boolean;
}

/**
 * Mendaftarkan pengguna: membuat akun Supabase Auth, lalu profil terkait
 * (id = auth user id). Untuk siswa menyimpan jenjang & kelas.
 */
export async function daftarPengguna(input: DaftarInput): Promise<HasilDaftar> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: { data: { full_name: input.nama, role: input.role } },
  });

  if (error) {
    // 400/422 untuk kesalahan validasi (mis. email sudah dipakai / sandi lemah).
    throw new AuthError(error.message, error.status ?? 400);
  }
  const user = data.user;
  if (!user) throw new AuthError("Gagal membuat akun.", 500);

  const schoolId = await pastikanSekolah(input.sekolah);

  const [profile] = await db
    .insert(profiles)
    .values({
      id: user.id,
      schoolId,
      fullName: input.nama,
      role: input.role,
      jenjang: input.role === "siswa" ? (input.jenjang ?? null) : null,
      kelas: input.role === "siswa" ? (input.kelas ?? null) : null,
    })
    .onConflictDoUpdate({
      target: profiles.id,
      set: { fullName: input.nama, schoolId },
    })
    .returning();

  // Perlindungan data anak: siapkan izin pemrosesan data default untuk siswa.
  if (input.role === "siswa") {
    await siapkanPrivasiAnak(profile.id);
  }

  return { profile, sesiAktif: !!data.session };
}

export interface HasilMasuk {
  profile: Profile | null;
}

/** Memasukkan pengguna (email + kata sandi); menulis sesi ke cookie. */
export async function masukPengguna(input: MasukInput): Promise<HasilMasuk> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error) {
    throw new AuthError("Email atau kata sandi salah.", 401);
  }
  const userId = data.user?.id;
  if (!userId) throw new AuthError("Gagal masuk.", 401);

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  return { profile: profile ?? null };
}

/** Mengeluarkan pengguna (menghapus sesi cookie). */
export async function keluarPengguna(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
}

/**
 * Menghapus akun pengguna secara permanen: menghapus baris profil (mencascade
 * data miliknya via FK), lalu pengguna Supabase Auth, dan mengakhiri sesi.
 * Hanya dapat dilakukan atas akun sendiri (profileId dari sesi).
 */
export async function hapusAkun(profileId: string): Promise<void> {
  // 1) Hapus profil → cascade ke data milik pengguna (sesi tutor, latihan, dll).
  await db.delete(profiles).where(eq(profiles.id, profileId));

  // 2) Hapus pengguna Auth (butuh service role; melewati RLS).
  const admin = createSupabaseAdminClient();
  const { error } = await admin.auth.admin.deleteUser(profileId);
  if (error) {
    throw new AuthError(`Gagal menghapus akun: ${error.message}`, 500);
  }

  // 3) Akhiri sesi cookie di perangkat ini.
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
}
