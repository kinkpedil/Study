import "server-only";

import { and, eq, desc, inArray, isNotNull } from "drizzle-orm";

import { db } from "@/db";
import {
  tutorSessions,
  tutorMessages,
  tutorEscalations,
  profiles,
  notifications,
  type TutorEscalation,
  type Profile,
} from "@/db/schema";

/**
 * Eskalasi sesi Tutor AI ke guru + notifikasi. Siswa meneruskan sesi belajarnya
 * agar dibantu manusia; guru/admin sekolah menerima notifikasi dan menangani
 * antrean eskalasi.
 *
 * `db` (koneksi server) melewati RLS, jadi kepemilikan & cakupan sekolah dicek
 * manual di sini — sejalan dengan pola service lain (RLS sebagai lapis kedua).
 */

export class EskalasiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "EskalasiError";
  }
}

/**
 * Siswa meneruskan sesi tutornya ke guru. Menyalin ringkasan sesi ke baris
 * eskalasi (didenormalisasi) dan mengirim notifikasi ke guru sekolahnya (atau
 * guru tujuan bila dipilih). Idempotensi ringan: satu eskalasi 'baru' per sesi.
 */
export async function buatEskalasi(
  sessionId: string,
  siswaId: string,
  catatan?: string,
  guruId?: string,
): Promise<TutorEscalation> {
  const [sesi] = await db
    .select()
    .from(tutorSessions)
    .where(eq(tutorSessions.id, sessionId))
    .limit(1);
  if (!sesi) throw new EskalasiError("Sesi tidak ditemukan.", 404);
  if (sesi.profileId !== siswaId) {
    throw new EskalasiError("Tidak berwenang atas sesi ini.", 403);
  }

  // Hindari duplikat: bila sudah ada eskalasi 'baru' untuk sesi ini, kembalikan.
  const [adaBaru] = await db
    .select()
    .from(tutorEscalations)
    .where(
      and(
        eq(tutorEscalations.sessionId, sessionId),
        eq(tutorEscalations.status, "baru"),
      ),
    )
    .limit(1);
  if (adaBaru) return adaBaru;

  const [siswa] = await db
    .select({ schoolId: profiles.schoolId, jenjang: profiles.jenjang, nama: profiles.fullName })
    .from(profiles)
    .where(eq(profiles.id, siswaId))
    .limit(1);

  const [eskalasi] = await db
    .insert(tutorEscalations)
    .values({
      sessionId,
      siswaId,
      schoolId: siswa?.schoolId ?? null,
      guruId: guruId ?? null,
      judul: sesi.judul,
      mapel: sesi.mapel,
      jenjang: sesi.jenjang,
      catatan: catatan ?? null,
    })
    .returning();

  await notifikasiGuru(
    { schoolId: siswa?.schoolId ?? null, guruId: guruId ?? null },
    siswa?.nama ?? "Seorang siswa",
    sesi.judul,
  );

  return eskalasi;
}

/** Label ramah untuk kategori risiko pada catatan & notifikasi. */
const labelRisiko: Record<string, string> = {
  keselamatan_diri: "keselamatan diri",
  kekerasan: "kekerasan",
  konten_dewasa: "konten dewasa",
  perundungan: "perundungan",
  data_pribadi: "data pribadi",
};

/**
 * Melaporkan indikasi berbahaya pada sebuah sesi tutor. Berbeda dari eskalasi
 * biasa: dipicu otomatis oleh filter keselamatan (atau dilaporkan siswa) saat
 * ada tanda bahaya. Kategori diambil server-authoritative dari pesan yang
 * ditandai `flagged`, bukan dari input klien. Guru/admin sekolah menerima
 * notifikasi mendesak agar segera menindaklanjuti.
 */
export async function laporIndikasiBerbahaya(
  sessionId: string,
  siswaId: string,
): Promise<TutorEscalation> {
  const [sesi] = await db
    .select()
    .from(tutorSessions)
    .where(eq(tutorSessions.id, sessionId))
    .limit(1);
  if (!sesi) throw new EskalasiError("Sesi tidak ditemukan.", 404);
  if (sesi.profileId !== siswaId) {
    throw new EskalasiError("Tidak berwenang atas sesi ini.", 403);
  }

  // Ambil kategori risiko terbaru yang ditandai filter keselamatan.
  const [pesanFlag] = await db
    .select({ kategori: tutorMessages.riskKategori })
    .from(tutorMessages)
    .where(
      and(
        eq(tutorMessages.sessionId, sessionId),
        eq(tutorMessages.sender, "siswa"),
        eq(tutorMessages.flagged, true),
        isNotNull(tutorMessages.riskKategori),
      ),
    )
    .orderBy(desc(tutorMessages.urutan))
    .limit(1);

  if (!pesanFlag?.kategori) {
    throw new EskalasiError("Tidak ada indikasi berbahaya pada sesi ini.", 422);
  }
  const kategori = pesanFlag.kategori;
  const label = labelRisiko[kategori] ?? kategori;

  const [siswa] = await db
    .select({ schoolId: profiles.schoolId, jenjang: profiles.jenjang, nama: profiles.fullName })
    .from(profiles)
    .where(eq(profiles.id, siswaId))
    .limit(1);

  // Idempotensi: satu laporan indikasi 'baru' per sesi.
  const catatan = `⚠️ Indikasi ${label} terdeteksi filter keselamatan. Mohon segera ditindaklanjuti.`;
  const [adaBaru] = await db
    .select()
    .from(tutorEscalations)
    .where(
      and(
        eq(tutorEscalations.sessionId, sessionId),
        eq(tutorEscalations.status, "baru"),
        eq(tutorEscalations.catatan, catatan),
      ),
    )
    .limit(1);
  if (adaBaru) return adaBaru;

  const [laporan] = await db
    .insert(tutorEscalations)
    .values({
      sessionId,
      siswaId,
      schoolId: siswa?.schoolId ?? null,
      judul: sesi.judul,
      mapel: sesi.mapel,
      jenjang: sesi.jenjang,
      catatan,
    })
    .returning();

  await notifikasiGuru(
    { schoolId: siswa?.schoolId ?? null, guruId: null },
    siswa?.nama ?? "Seorang siswa",
    sesi.judul,
    `⚠️ Indikasi ${label} pada sesi tutor "${sesi.judul}" (${siswa?.nama ?? "siswa"}). Mohon segera ditindaklanjuti.`,
  );

  return laporan;
}

/** Kirim notifikasi ke guru tujuan, atau seluruh guru/admin sekolah siswa. */
async function notifikasiGuru(
  target: { schoolId: string | null; guruId: string | null },
  namaSiswa: string,
  judul: string,
  pesan?: string,
): Promise<void> {
  let penerima: { id: string }[] = [];
  if (target.guruId) {
    penerima = [{ id: target.guruId }];
  } else if (target.schoolId) {
    penerima = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(
        and(
          eq(profiles.schoolId, target.schoolId),
          inArray(profiles.role, ["guru", "admin"]),
        ),
      );
  }
  if (penerima.length === 0) return;

  const title = pesan ? "Indikasi berbahaya terdeteksi" : "Permintaan bantuan siswa";
  const message =
    pesan ?? `${namaSiswa} meneruskan sesi tutor "${judul}" untuk kamu bantu.`;

  await db.insert(notifications).values(
    penerima.map((p) => ({
      userId: p.id,
      type: "sistem" as const,
      title,
      message,
      link: "/tutor/eskalasi",
    })),
  );
}

export interface EskalasiRingkas {
  id: string;
  siswa: string;
  jenjang: string | null;
  mapel: string;
  judul: string;
  catatan: string | null;
  status: string;
  createdAt: string;
}

/** Memastikan pengguna adalah guru/admin; melempar bila bukan. */
function pastikanGuru(profil: Profile | null): Profile {
  if (!profil) throw new EskalasiError("Tidak terautentikasi.", 401);
  if (profil.role !== "guru" && profil.role !== "admin") {
    throw new EskalasiError("Khusus guru/admin.", 403);
  }
  return profil;
}

/** Daftar eskalasi untuk guru/admin, di-scope ke sekolahnya, terbaru dulu. */
export async function listEskalasiGuru(
  profil: Profile | null,
): Promise<EskalasiRingkas[]> {
  const guru = pastikanGuru(profil);
  if (!guru.schoolId) return [];

  const rows = await db
    .select({
      id: tutorEscalations.id,
      siswa: profiles.fullName,
      jenjang: tutorEscalations.jenjang,
      mapel: tutorEscalations.mapel,
      judul: tutorEscalations.judul,
      catatan: tutorEscalations.catatan,
      status: tutorEscalations.status,
      createdAt: tutorEscalations.createdAt,
    })
    .from(tutorEscalations)
    .innerJoin(profiles, eq(profiles.id, tutorEscalations.siswaId))
    .where(eq(tutorEscalations.schoolId, guru.schoolId))
    .orderBy(desc(tutorEscalations.createdAt))
    .limit(50);

  return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
}

/** Guru/admin menandai satu eskalasi sekolahnya sebagai ditangani. */
export async function tandaiEskalasiDitangani(
  escalationId: string,
  profil: Profile | null,
): Promise<void> {
  const guru = pastikanGuru(profil);
  if (!guru.schoolId) {
    throw new EskalasiError("Eskalasi tidak ditemukan.", 404);
  }

  const updated = await db
    .update(tutorEscalations)
    .set({ status: "ditangani", updatedAt: new Date() })
    .where(
      and(
        eq(tutorEscalations.id, escalationId),
        eq(tutorEscalations.schoolId, guru.schoolId),
      ),
    )
    .returning({ id: tutorEscalations.id });

  if (updated.length === 0) {
    throw new EskalasiError("Eskalasi tidak ditemukan.", 404);
  }
}
