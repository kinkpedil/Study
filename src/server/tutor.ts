import "server-only";

import { and, eq, asc, desc, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  tutorSessions,
  tutorMessages,
  type TutorSession,
  type TutorMessageRow,
} from "@/db/schema";
import type { BuatSesiTutorInput } from "@/lib/validation/tutor";

/**
 * Service pengelolaan sesi & pesan Tutor AI Pribadi (CRUD milik siswa).
 * Balasan AI dan moderasi topik berisiko ditangani service terpisah; di sini
 * fokus pada kepemilikan data dan penyimpanan pesan. Semua akses dibatasi ke
 * pemilik sesi (owner-check manual, sejalan dengan RLS owner-only).
 */

export class TutorError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "TutorError";
  }
}

function judulDari(teks: string): string {
  const t = teks.trim().replace(/\s+/g, " ");
  return t.length > 60 ? `${t.slice(0, 57)}…` : t;
}

/**
 * Membuka sesi tutor baru milik siswa. Bila ada pertanyaan pembuka, disimpan
 * sebagai pesan pertama; judul diturunkan dari pertanyaan bila tidak diberikan.
 * Mengembalikan sesi yang dibuat.
 */
export async function buatSesiTutor(
  input: BuatSesiTutorInput,
  profileId: string,
): Promise<TutorSession> {
  const judul =
    input.judul ??
    (input.pertanyaan ? judulDari(input.pertanyaan) : `Sesi ${input.mapel}`);

  return db.transaction(async (tx) => {
    const [sesi] = await tx
      .insert(tutorSessions)
      .values({
        profileId,
        judul,
        mapel: input.mapel,
        jenjang: input.jenjang,
      })
      .returning();

    if (input.pertanyaan) {
      await tx.insert(tutorMessages).values({
        sessionId: sesi.id,
        sender: "siswa",
        content: input.pertanyaan,
        urutan: 0,
      });
    }

    return sesi;
  });
}

export interface RingkasanSesiTutor {
  id: string;
  judul: string;
  mapel: string;
  jenjang: string | null;
  status: string;
  cuplikan: string | null;
  jumlahPesan: number;
  updatedAt: string;
}

/** Daftar sesi tutor milik siswa, terbaru diperbarui dulu. */
export async function listSesiTutor(
  profileId: string,
  limit = 30,
): Promise<RingkasanSesiTutor[]> {
  const rows = await db
    .select({
      id: tutorSessions.id,
      judul: tutorSessions.judul,
      mapel: tutorSessions.mapel,
      jenjang: tutorSessions.jenjang,
      status: tutorSessions.status,
      updatedAt: tutorSessions.updatedAt,
      jumlahPesan: sql<number>`(
        select count(*)::int from ${tutorMessages} m
        where m.session_id = ${tutorSessions.id}
      )`,
      cuplikan: sql<string | null>`(
        select m.content from ${tutorMessages} m
        where m.session_id = ${tutorSessions.id}
        order by m.urutan desc limit 1
      )`,
    })
    .from(tutorSessions)
    .where(eq(tutorSessions.profileId, profileId))
    .orderBy(desc(tutorSessions.updatedAt))
    .limit(limit);

  return rows.map((r) => ({ ...r, updatedAt: r.updatedAt.toISOString() }));
}

/** Memuat sesi milik pengguna (owner-check manual). */
async function ambilSesiMilik(
  sessionId: string,
  profileId: string,
): Promise<TutorSession> {
  const [sesi] = await db
    .select()
    .from(tutorSessions)
    .where(eq(tutorSessions.id, sessionId))
    .limit(1);
  if (!sesi) throw new TutorError("Sesi tidak ditemukan.", 404);
  if (sesi.profileId !== profileId) {
    throw new TutorError("Tidak berwenang atas sesi ini.", 403);
  }
  return sesi;
}

/** Detail sesi + seluruh pesan (urut). */
export async function getSesiTutor(
  sessionId: string,
  profileId: string,
): Promise<{ sesi: TutorSession; messages: TutorMessageRow[] }> {
  const sesi = await ambilSesiMilik(sessionId, profileId);
  const messages = await db
    .select()
    .from(tutorMessages)
    .where(eq(tutorMessages.sessionId, sessionId))
    .orderBy(asc(tutorMessages.urutan));
  return { sesi, messages };
}

/**
 * Menambah satu pesan siswa ke sesi dan memutakhirkan `updatedAt`. Balasan AI
 * ditambahkan service terpisah. Mengembalikan pesan siswa yang tersimpan.
 */
export async function tambahPesanSiswa(
  sessionId: string,
  profileId: string,
  isi: string,
): Promise<TutorMessageRow> {
  await ambilSesiMilik(sessionId, profileId);

  return db.transaction(async (tx) => {
    const [{ maks }] = await tx
      .select({ maks: sql<number>`coalesce(max(${tutorMessages.urutan}), -1)` })
      .from(tutorMessages)
      .where(eq(tutorMessages.sessionId, sessionId));

    const [pesan] = await tx
      .insert(tutorMessages)
      .values({
        sessionId,
        sender: "siswa",
        content: isi,
        urutan: maks + 1,
      })
      .returning();

    await tx
      .update(tutorSessions)
      .set({ updatedAt: sql`now()` })
      .where(eq(tutorSessions.id, sessionId));

    return pesan;
  });
}

/** Menandai sesi selesai (atau kembali berlangsung). */
export async function setStatusSesi(
  sessionId: string,
  profileId: string,
  status: TutorSession["status"],
): Promise<void> {
  await ambilSesiMilik(sessionId, profileId);
  await db
    .update(tutorSessions)
    .set({ status, updatedAt: sql`now()` })
    .where(
      and(
        eq(tutorSessions.id, sessionId),
        eq(tutorSessions.profileId, profileId),
      ),
    );
}
