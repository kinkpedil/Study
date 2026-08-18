import "server-only";

import { and, eq, asc, desc, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  tutorSessions,
  tutorMessages,
  profiles,
  learningProgress,
  type TutorSession,
  type TutorMessageRow,
} from "@/db/schema";
import { chatComplete, type ChatMessage } from "@/lib/ai/provider";
import { getJenjangStyle } from "@/lib/jenjang-style";
import type { Jenjang } from "@/lib/mock/beranda";
import {
  periksaRisikoSiswa,
  filterResponsAi,
} from "@/server/tutor-keselamatan";
import { laporIndikasiBerbahaya } from "@/server/eskalasi-tutor";
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

/* ------------------------------ balasan AI ------------------------------ */

/** Berapa banyak pesan terakhir yang dikirim sebagai konteks ke AI. */
const MAKS_KONTEKS = 16;

/**
 * Prompt sistem tutor: pendamping belajar pribadi yang sabar, adaptif jenjang &
 * mapel, aman untuk anak, dan mendorong PEMAHAMAN (bukan sekadar jawaban).
 * Menyisipkan penguasaan siswa pada mapel bila tersedia agar respons personal.
 */
function sistemTutor(
  jenjang: Jenjang | null | undefined,
  mapel: string,
  nama: string | null,
  penguasaan: number | null,
): string {
  const gaya = getJenjangStyle(jenjang);
  const sapaan = nama ? `Nama siswamu ${nama}. ` : "";
  const konteksNilai =
    penguasaan !== null
      ? `Penguasaan siswa pada ${mapel} sekitar ${penguasaan}%. Sesuaikan kedalaman: beri dasar bila rendah, tantang bila tinggi. `
      : "";
  return [
    `Kamu tutor pribadi yang sabar dan ramah untuk siswa Indonesia jenjang ${gaya.label}, mapel ${mapel}.`,
    sapaan + konteksNilai,
    `Gaya bahasa: ${gaya.detail}`,
    "Tujuanmu membuat siswa PAHAM: bimbing dengan pertanyaan pemantik dan langkah kecil, beri contoh nyata, dan cek pemahaman. Jangan hanya memberi jawaban jadi.",
    "Aman untuk anak: jangan pernah membahas konten dewasa, kekerasan, atau berbahaya. Bila siswa menyiratkan bahaya pada dirinya atau masalah serius, tanggapi dengan lembut dan sarankan bicara ke guru atau orang dewasa tepercaya.",
    "Jawab singkat, hangat, dan mudah dipahami. Gunakan bahasa Indonesia.",
  ].join(" ");
}

/** Penguasaan siswa pada satu mapel (0-100) atau null bila belum ada data. */
async function penguasaanMapel(
  profileId: string,
  mapel: string,
): Promise<number | null> {
  const [row] = await db
    .select({ mastery: learningProgress.masteryPercent })
    .from(learningProgress)
    .where(
      and(
        eq(learningProgress.profileId, profileId),
        eq(learningProgress.mapel, mapel),
      ),
    )
    .limit(1);
  return row?.mastery ?? null;
}

/** Menyusun riwayat percakapan menjadi pesan chat untuk provider AI. */
function keChatMessages(riwayat: TutorMessageRow[]): ChatMessage[] {
  return riwayat.slice(-MAKS_KONTEKS).map((m) => ({
    role: m.sender === "siswa" ? "user" : "assistant",
    content: m.content,
  }));
}

export interface HasilPesanTutor {
  pesanSiswa: TutorMessageRow;
  pesanAi: TutorMessageRow;
  /** Terisi bila pesan siswa menyentuh topik berisiko (untuk UI peringatan). */
  peringatan: {
    kategori: string;
    eskalasi: boolean;
  } | null;
}

/**
 * Alur utama tutor AI: menyimpan pesan siswa, memanggil provider AI dengan
 * konteks sesi (jenjang, mapel, penguasaan, riwayat) untuk respons personal,
 * lalu menyimpan balasan tutor. Mengembalikan kedua pesan.
 *
 * Panggilan AI dilakukan di luar transaksi (operasi jaringan lambat); penulisan
 * pesan siswa & balasan dijaga berurutan lewat kolom `urutan`.
 */
export async function kirimPesanTutor(
  sessionId: string,
  profileId: string,
  isi: string,
): Promise<HasilPesanTutor> {
  const sesi = await ambilSesiMilik(sessionId, profileId);

  const riwayat = await db
    .select()
    .from(tutorMessages)
    .where(eq(tutorMessages.sessionId, sessionId))
    .orderBy(asc(tutorMessages.urutan));

  const urutanSiswa =
    (riwayat.at(-1)?.urutan ?? -1) + 1;

  // Lapis 1: periksa topik berisiko pada pesan siswa (perlindungan anak).
  const risiko = await periksaRisikoSiswa(isi);

  const [pesanSiswa] = await db
    .insert(tutorMessages)
    .values({
      sessionId,
      sender: "siswa",
      content: isi,
      urutan: urutanSiswa,
      flagged: risiko.berisiko,
      riskKategori: risiko.kategori,
    })
    .returning();

  // Topik berisiko: JANGAN panggil model; beri tanggapan aman deterministik.
  if (risiko.berisiko) {
    const [pesanAiAman] = await db
      .insert(tutorMessages)
      .values({
        sessionId,
        sender: "ai",
        content: risiko.pesanAman,
        urutan: urutanSiswa + 1,
        flagged: true,
        riskKategori: risiko.kategori,
      })
      .returning();

    await db
      .update(tutorSessions)
      .set({ updatedAt: sql`now()` })
      .where(eq(tutorSessions.id, sessionId));

    // Indikasi serius → laporkan otomatis ke guru/admin (best-effort; tidak
    // boleh menggagalkan tanggapan aman untuk siswa).
    if (risiko.eskalasi) {
      try {
        await laporIndikasiBerbahaya(sessionId, profileId);
      } catch (err) {
        console.error("Auto-lapor indikasi berbahaya gagal:", err);
      }
    }

    return {
      pesanSiswa,
      pesanAi: pesanAiAman,
      peringatan: { kategori: risiko.kategori!, eskalasi: risiko.eskalasi },
    };
  }

  const [profil] = await db
    .select({ nama: profiles.fullName, jenjang: profiles.jenjang })
    .from(profiles)
    .where(eq(profiles.id, profileId))
    .limit(1);

  const jenjang = (sesi.jenjang ?? profil?.jenjang ?? null) as Jenjang | null;
  const penguasaan = await penguasaanMapel(profileId, sesi.mapel);

  const balasan = await chatComplete(
    [
      {
        role: "system",
        content: sistemTutor(jenjang, sesi.mapel, profil?.nama ?? null, penguasaan),
      },
      ...keChatMessages([...riwayat, pesanSiswa]),
    ],
    { maxTokens: 700 },
  );

  // Lapis 2: saring respons AI sebelum sampai ke siswa.
  const filter = await filterResponsAi(balasan.trim());

  const [pesanAi] = await db
    .insert(tutorMessages)
    .values({
      sessionId,
      sender: "ai",
      content: filter.teks,
      urutan: urutanSiswa + 1,
      flagged: !filter.aman,
    })
    .returning();

  await db
    .update(tutorSessions)
    .set({ updatedAt: sql`now()` })
    .where(eq(tutorSessions.id, sessionId));

  return { pesanSiswa, pesanAi, peringatan: null };
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
