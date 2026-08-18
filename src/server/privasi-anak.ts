import "server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  profiles,
  dataPermissions,
  parentalConsents,
  type Profile,
} from "@/db/schema";

/**
 * Perlindungan privasi data pengguna di bawah umur (siswa).
 *
 * - Semua akun siswa diperlakukan sebagai anak yang dilindungi.
 * - Saat pendaftaran, izin pemrosesan data default disiapkan (data belajar
 *   wajib aktif; fitur AI aktif; rekomendasi personal nonaktif secara default,
 *   mengikuti prinsip minimalisasi data).
 * - Fitur yang memproses data anak (mis. AI) memeriksa izin terkait dulu; bila
 *   dimatikan wali/siswa, pemrosesan ditolak.
 */

export class PrivasiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "PrivasiError";
  }
}

/** Kunci izin pemrosesan data & default untuk akun anak. */
export const IZIN_DEFAULT: { key: string; aktif: boolean }[] = [
  { key: "belajar", aktif: true },
  { key: "ai", aktif: true },
  { key: "rekomendasi", aktif: false },
];

/** Siswa diperlakukan sebagai anak yang dilindungi. */
export function isAnak(profile: Pick<Profile, "role">): boolean {
  return profile.role === "siswa";
}

/**
 * Menyiapkan izin data default untuk akun anak (idempoten). Dipanggil saat
 * pendaftaran siswa. Tidak menimpa pilihan yang sudah ada.
 */
export async function siapkanPrivasiAnak(profileId: string): Promise<void> {
  await db
    .insert(dataPermissions)
    .values(
      IZIN_DEFAULT.map((i) => ({
        profileId,
        izinKey: i.key,
        aktif: i.aktif,
      })),
    )
    .onConflictDoNothing({
      target: [dataPermissions.profileId, dataPermissions.izinKey],
    });
}

/** Apakah izin bernama `key` aktif untuk pengguna (default: tidak ada = false). */
export async function punyaIzin(
  profileId: string,
  key: string,
): Promise<boolean> {
  const [row] = await db
    .select({ aktif: dataPermissions.aktif })
    .from(dataPermissions)
    .where(
      and(
        eq(dataPermissions.profileId, profileId),
        eq(dataPermissions.izinKey, key),
      ),
    )
    .limit(1);
  return row?.aktif ?? false;
}

/**
 * Menegakkan izin fitur AI untuk akun anak. Untuk siswa, fitur AI hanya boleh
 * memproses data bila izin "ai" aktif. Non-siswa tidak dibatasi di sini.
 * Melempar PrivasiError(403) bila ditolak.
 */
export async function pastikanIzinAI(profileId: string): Promise<void> {
  const [p] = await db
    .select({ role: profiles.role })
    .from(profiles)
    .where(eq(profiles.id, profileId))
    .limit(1);
  if (!p || p.role !== "siswa") return;

  const izin = await punyaIzin(profileId, "ai");
  if (!izin) {
    throw new PrivasiError(
      "Fitur AI dinonaktifkan untuk akun ini. Aktifkan izin di Akun › Privasi & Data (dengan sepengetahuan orang tua/wali).",
      403,
    );
  }
}

export interface StatusPrivasi {
  anak: boolean;
  izin: Record<string, boolean>;
  persetujuan: {
    status: string;
    waliNama: string | null;
    waliEmail: string | null;
  } | null;
}

/** Ringkasan status privasi pengguna: izin data & persetujuan wali. */
export async function getStatusPrivasi(
  profile: Profile,
): Promise<StatusPrivasi> {
  const izinRows = await db
    .select({ key: dataPermissions.izinKey, aktif: dataPermissions.aktif })
    .from(dataPermissions)
    .where(eq(dataPermissions.profileId, profile.id));

  const [consent] = await db
    .select({
      status: parentalConsents.status,
      waliNama: parentalConsents.waliNama,
      waliEmail: parentalConsents.waliEmail,
    })
    .from(parentalConsents)
    .where(eq(parentalConsents.profileId, profile.id))
    .limit(1);

  return {
    anak: isAnak(profile),
    izin: Object.fromEntries(izinRows.map((r) => [r.key, r.aktif])),
    persetujuan: consent
      ? {
          status: consent.status,
          waliNama: consent.waliNama,
          waliEmail: consent.waliEmail,
        }
      : null,
  };
}
