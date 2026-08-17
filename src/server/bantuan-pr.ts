import "server-only";

import { z } from "zod";

import { and, eq, asc, desc, ne, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  homeworkSessions,
  homeworkMessages,
  type HomeworkMessage,
} from "@/db/schema";
import { chatJson, chatComplete } from "@/lib/ai/provider";
import { getJenjangStyle } from "@/lib/jenjang-style";
import type { PetunjukInput, KlarifikasiInput } from "@/lib/validation/bantuan-pr";

/**
 * Service AI Bantuan PR: menghasilkan PETUNJUK BERTAHAP (bukan jawaban instan)
 * dengan bahasa yang adaptif terhadap jenjang siswa. Semua pemanggilan AI lewat
 * abstraksi provider (server-side); API key tidak pernah ke browser.
 */

const petunjukAiSchema = z.object({
  petunjuk: z.array(z.string().min(1)).min(1),
  langkahFinal: z.array(z.string().min(1)).min(1),
  jawabanAkhir: z.string().min(1),
});

export interface HasilPetunjuk {
  petunjuk: string[];
  langkahFinal: string[];
  jawabanAkhir: string;
}

/** Panduan gaya bahasa & keamanan anak, disisipkan ke prompt sistem. */
function sistemBantuan(jenjang: PetunjukInput["jenjang"]): string {
  const gaya = getJenjangStyle(jenjang);
  return [
    "Kamu tutor yang sabar untuk siswa Indonesia. Tujuanmu membuat siswa PAHAM,",
    "bukan sekadar memberi jawaban. Berikan PETUNJUK BERTAHAP: tiap petunjuk",
    "mengarahkan satu langkah berpikir tanpa langsung membocorkan jawaban akhir.",
    `Sesuaikan bahasa untuk jenjang ${gaya.label}: ${gaya.detail}`,
    "Aman untuk anak: hindari konten berbahaya, kasar, atau tidak pantas.",
    "Balas HANYA JSON valid sesuai format yang diminta, tanpa teks lain.",
  ].join(" ");
}

/**
 * Menghasilkan petunjuk bertahap + langkah penyelesaian + jawaban akhir ringkas.
 * Jawaban akhir dipisah agar UI bisa menahannya sampai siswa memintanya.
 */
export async function generatePetunjuk(
  input: PetunjukInput,
): Promise<HasilPetunjuk> {
  const user = `Soal dari siswa (${input.mapel}): "${input.pertanyaan}"
${input.fotoUrl ? "Siswa juga melampirkan foto soal.\n" : ""}
Buat tepat ${input.jumlah} petunjuk bertahap. Format JSON:
{
  "petunjuk": ["petunjuk 1", "petunjuk 2", ...],   // ${input.jumlah} item, tidak membocorkan jawaban
  "langkahFinal": ["langkah 1", "langkah 2", ...], // langkah penyelesaian lengkap
  "jawabanAkhir": "jawaban ringkas dan jelas"
}`;

  const raw = await chatJson<unknown>([
    { role: "system", content: sistemBantuan(input.jenjang) },
    { role: "user", content: user },
  ]);
  return petunjukAiSchema.parse(raw);
}

/**
 * Menjawab tindak lanjut siswa dengan satu petunjuk klarifikasi (tetap
 * pedagogis, tidak langsung memberi jawaban), adaptif jenjang.
 */
export async function jawabKlarifikasi(
  input: KlarifikasiInput,
): Promise<string> {
  const user = `Soal awal (${input.mapel}): "${input.pertanyaanAwal}"
Siswa bertanya lanjutan: "${input.tindakLanjut}"
Beri SATU petunjuk klarifikasi singkat yang membantu siswa maju satu langkah, tanpa memberi jawaban akhir. Balas teks biasa.`;

  const teks = await chatComplete([
    { role: "system", content: sistemBantuan(input.jenjang) },
    { role: "user", content: user },
  ]);
  return teks.trim();
}

export interface SesiBantuanDibuat extends HasilPetunjuk {
  sessionId: string;
  judul: string;
}

function judulDari(pertanyaan: string): string {
  const t = pertanyaan.trim().replace(/\s+/g, " ");
  return t.length > 60 ? `${t.slice(0, 57)}…` : t;
}

/**
 * Membuka sesi Bantuan PR: memanggil AI untuk petunjuk bertahap, lalu menyimpan
 * sesi + pesan (pertanyaan siswa, petunjuk, langkah, jawaban) milik pengguna.
 */
export async function bukaSesiBantuan(
  input: PetunjukInput,
  profileId: string,
): Promise<SesiBantuanDibuat> {
  const hasil = await generatePetunjuk(input);
  const judul = judulDari(input.pertanyaan);

  const sessionId = await db.transaction(async (tx) => {
    const [sesi] = await tx
      .insert(homeworkSessions)
      .values({
        profileId,
        judul,
        mapel: input.mapel,
        jenjang: input.jenjang,
        pertanyaan: input.pertanyaan,
        fotoUrl: input.fotoUrl,
      })
      .returning({ id: homeworkSessions.id });

    let urutan = 0;
    const pesan = [
      {
        sessionId: sesi.id,
        sender: "siswa" as const,
        tipe: "pertanyaan" as const,
        content: input.pertanyaan,
        urutan: urutan++,
      },
      ...hasil.petunjuk.map((teks) => ({
        sessionId: sesi.id,
        sender: "ai" as const,
        tipe: "petunjuk" as const,
        content: teks,
        urutan: urutan++,
      })),
      {
        sessionId: sesi.id,
        sender: "ai" as const,
        tipe: "langkah" as const,
        content: hasil.langkahFinal.join("\n"),
        urutan: urutan++,
      },
      {
        sessionId: sesi.id,
        sender: "ai" as const,
        tipe: "jawaban" as const,
        content: hasil.jawabanAkhir,
        urutan: urutan++,
      },
    ];

    await tx.insert(homeworkMessages).values(pesan);
    return sesi.id;
  });

  return { sessionId, judul, ...hasil };
}

export interface RiwayatSesi {
  id: string;
  judul: string;
  mapel: string;
  jenjang: string | null;
  cuplikan: string;
  status: string;
  jumlahPetunjuk: number;
  createdAt: string;
}

/** Daftar riwayat sesi Bantuan PR milik pengguna, terbaru dulu. */
export async function listRiwayatBantuan(
  profileId: string,
  limit = 30,
): Promise<RiwayatSesi[]> {
  const rows = await db
    .select({
      id: homeworkSessions.id,
      judul: homeworkSessions.judul,
      mapel: homeworkSessions.mapel,
      jenjang: homeworkSessions.jenjang,
      cuplikan: homeworkSessions.pertanyaan,
      status: homeworkSessions.status,
      createdAt: homeworkSessions.createdAt,
      jumlahPetunjuk: sql<number>`(
        select count(*)::int from ${homeworkMessages} m
        where m.session_id = ${homeworkSessions.id} and m.tipe = 'petunjuk'
      )`,
    })
    .from(homeworkSessions)
    .where(eq(homeworkSessions.profileId, profileId))
    .orderBy(desc(homeworkSessions.createdAt))
    .limit(limit);

  return rows.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));
}

export class BantuanError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "BantuanError";
  }
}

/** Memuat sesi milik pengguna beserta pesannya (owner-check manual). */
async function ambilSesiMilik(sessionId: string, profileId: string) {
  const [sesi] = await db
    .select()
    .from(homeworkSessions)
    .where(eq(homeworkSessions.id, sessionId))
    .limit(1);
  if (!sesi) throw new BantuanError("Sesi tidak ditemukan.", 404);
  if (sesi.profileId !== profileId) {
    throw new BantuanError("Tidak berwenang atas sesi ini.", 403);
  }
  return sesi;
}

/**
 * Detail sesi + pesan. Jawaban akhir DISEMBUNYIKAN kecuali `includeJawaban`,
 * agar siswa mencoba petunjuk lebih dulu (jawaban diminta terpisah).
 */
export async function getSesiBantuan(
  sessionId: string,
  profileId: string,
  includeJawaban = false,
) {
  const sesi = await ambilSesiMilik(sessionId, profileId);

  const where = includeJawaban
    ? eq(homeworkMessages.sessionId, sessionId)
    : and(
        eq(homeworkMessages.sessionId, sessionId),
        ne(homeworkMessages.tipe, "jawaban"),
      );

  const messages: HomeworkMessage[] = await db
    .select()
    .from(homeworkMessages)
    .where(where)
    .orderBy(asc(homeworkMessages.urutan));

  return { sesi, messages };
}

/** Mengambil jawaban akhir sesi (aksi terpisah "minta jawaban akhir"). */
export async function getJawabanAkhir(
  sessionId: string,
  profileId: string,
): Promise<string> {
  await ambilSesiMilik(sessionId, profileId);
  const [msg] = await db
    .select({ content: homeworkMessages.content })
    .from(homeworkMessages)
    .where(
      and(
        eq(homeworkMessages.sessionId, sessionId),
        eq(homeworkMessages.tipe, "jawaban"),
      ),
    )
    .limit(1);
  if (!msg) throw new BantuanError("Jawaban akhir belum tersedia.", 404);
  return msg.content;
}

/**
 * "Minta petunjuk berikutnya": siswa mengirim tindak lanjut, AI membalas satu
 * petunjuk klarifikasi. Kedua pesan disimpan; mengembalikan pesan AI baru.
 */
export async function mintaPetunjukBerikutnya(
  sessionId: string,
  profileId: string,
  tindakLanjut: string,
): Promise<HomeworkMessage> {
  const sesi = await ambilSesiMilik(sessionId, profileId);

  const jawaban = await jawabKlarifikasi({
    pertanyaanAwal: sesi.pertanyaan,
    mapel: sesi.mapel,
    jenjang: (sesi.jenjang ?? "SMP") as PetunjukInput["jenjang"],
    tindakLanjut,
  });

  return db.transaction(async (tx) => {
    // Sisipkan di akhir urutan.
    const [{ maks }] = await tx
      .select({ maks: sql<number>`coalesce(max(${homeworkMessages.urutan}), -1)` })
      .from(homeworkMessages)
      .where(eq(homeworkMessages.sessionId, sessionId));
    const dasar = maks + 1;

    await tx.insert(homeworkMessages).values({
      sessionId,
      sender: "siswa",
      tipe: "klarifikasi",
      content: tindakLanjut,
      urutan: dasar,
    });
    const [aiMsg] = await tx
      .insert(homeworkMessages)
      .values({
        sessionId,
        sender: "ai",
        tipe: "petunjuk",
        content: jawaban,
        urutan: dasar + 1,
      })
      .returning();
    return aiMsg;
  });
}
