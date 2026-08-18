import "server-only";

import { and, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { profiles, dataPermissions, type Profile } from "@/db/schema";
import type { UpdateProfilInput, PreferensiInput } from "@/lib/validation/akun";

/**
 * Layanan kelola profil & preferensi pengguna. Profil: perubahan terbatas
 * (nama, kelas untuk siswa). Preferensi/izin disimpan sebagai pasangan
 * key→aktif di `data_permissions` (owner-only). Semua dibatasi ke pengguna
 * sendiri (profileId dari sesi).
 */

export class AkunError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "AkunError";
  }
}

/** Profil pengguna login. */
export async function getProfil(profileId: string): Promise<Profile> {
  const [p] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, profileId))
    .limit(1);
  if (!p) throw new AkunError("Profil tidak ditemukan.", 404);
  return p;
}

/**
 * Memperbarui profil sendiri. Hanya nama & kelas yang dapat diubah; kelas hanya
 * berlaku untuk siswa. Email, role, jenjang, dan sekolah dikelola sistem.
 */
export async function updateProfil(
  profileId: string,
  input: UpdateProfilInput,
): Promise<Profile> {
  const saatIni = await getProfil(profileId);

  const set: Partial<typeof profiles.$inferInsert> = {};
  if (input.nama !== undefined) set.fullName = input.nama;
  // Kelas hanya relevan untuk siswa.
  if (input.kelas !== undefined && saatIni.role === "siswa") {
    set.kelas = input.kelas;
  }

  if (Object.keys(set).length === 0) return saatIni;

  const [updated] = await db
    .update(profiles)
    .set(set)
    .where(eq(profiles.id, profileId))
    .returning();
  return updated;
}

/** Preferensi sebagai peta key→aktif. */
export async function getPreferensi(
  profileId: string,
): Promise<Record<string, boolean>> {
  const rows = await db
    .select({ key: dataPermissions.izinKey, aktif: dataPermissions.aktif })
    .from(dataPermissions)
    .where(eq(dataPermissions.profileId, profileId));
  return Object.fromEntries(rows.map((r) => [r.key, r.aktif]));
}

/**
 * Menyetel sekumpulan preferensi/izin (upsert per key). Mengembalikan peta
 * preferensi terbaru milik pengguna.
 */
export async function setPreferensi(
  profileId: string,
  input: PreferensiInput,
): Promise<Record<string, boolean>> {
  await db
    .insert(dataPermissions)
    .values(
      input.preferensi.map((p) => ({
        profileId,
        izinKey: p.key,
        aktif: p.aktif,
      })),
    )
    .onConflictDoUpdate({
      target: [dataPermissions.profileId, dataPermissions.izinKey],
      set: { aktif: sql`excluded.aktif`, updatedAt: sql`now()` },
    });

  return getPreferensi(profileId);
}

/** Menghapus satu preferensi (opsional; mis. mencabut izin). */
export async function hapusPreferensi(
  profileId: string,
  key: string,
): Promise<void> {
  await db
    .delete(dataPermissions)
    .where(
      and(
        eq(dataPermissions.profileId, profileId),
        eq(dataPermissions.izinKey, key),
      ),
    );
}
