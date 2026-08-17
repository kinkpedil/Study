import "server-only";

import { z } from "zod";

import { db } from "@/db";
import { exerciseSets, questions } from "@/db/schema";
import { chatJson } from "@/lib/ai/provider";
import type { GenerateLatihanInput } from "@/lib/validation/latihan";

/** Skema balasan AI, divalidasi sebelum disimpan. */
const aiOpsiSchema = z.object({ id: z.string(), teks: z.string() });
const aiSoalSchema = z.object({
  soal: z
    .array(
      z.object({
        tipe: z.enum(["pilihan_ganda", "esai"]),
        pertanyaan: z.string().min(1),
        opsi: z.array(aiOpsiSchema).min(2).max(6).optional(),
        kunci: z.string().min(1),
        pembahasan: z.string().default(""),
      }),
    )
    .min(1),
});

function buildPrompt(input: GenerateLatihanInput) {
  const tipeInstruksi =
    input.tipe === "campuran"
      ? "campuran pilihan ganda dan esai"
      : input.tipe === "esai"
        ? "semuanya esai"
        : "semuanya pilihan ganda dengan 4 opsi (a–d)";

  const system =
    "Kamu guru yang membuat soal latihan untuk siswa Indonesia. Buat soal yang " +
    "akurat, sesuai jenjang & kurikulum, dengan bahasa yang jelas dan aman untuk " +
    "anak. Untuk pilihan ganda, sertakan tepat satu jawaban benar. Kembalikan " +
    "HANYA JSON valid sesuai format yang diminta, tanpa teks lain.";

  const user = `Buat ${input.jumlah} soal ${tipeInstruksi}.
Jenjang: ${input.jenjang}
Kelas: ${input.kelas}
Mata pelajaran: ${input.mapel}
Topik: ${input.topik && input.topik.length > 0 ? input.topik : "campuran topik sesuai kelas"}
Tingkat kesulitan: ${input.kesulitan}

Format JSON:
{
  "soal": [
    {
      "tipe": "pilihan_ganda" | "esai",
      "pertanyaan": "teks soal",
      "opsi": [{"id":"a","teks":"..."}, ...],   // hanya untuk pilihan_ganda
      "kunci": "id opsi benar (mis. \\"b\\") untuk PG, atau contoh jawaban untuk esai",
      "pembahasan": "penjelasan langkah/alasan"
    }
  ]
}`;

  return { system, user };
}

export interface GeneratedLatihan {
  exerciseSetId: string;
  judul: string;
  jumlah: number;
}

/**
 * Membuat paket latihan: memanggil AI untuk menghasilkan soal, memvalidasi
 * hasilnya, lalu menyimpan exercise_set + questions milik pengguna.
 */
export async function generateLatihan(
  input: GenerateLatihanInput,
  authorProfileId: string,
): Promise<GeneratedLatihan> {
  const { system, user } = buildPrompt(input);

  const raw = await chatJson<unknown>([
    { role: "system", content: system },
    { role: "user", content: user },
  ]);
  const parsed = aiSoalSchema.parse(raw);

  const judul = `${input.mapel}${input.topik ? ` — ${input.topik}` : ""} (${input.jenjang} ${input.kelas})`;

  return db.transaction(async (tx) => {
    const [set] = await tx
      .insert(exerciseSets)
      .values({
        authorProfileId,
        judul,
        jenjang: input.jenjang,
        kelas: input.kelas,
        mapel: input.mapel,
        topik: input.topik,
        kesulitan: input.kesulitan,
        jumlahSoal: parsed.soal.length,
      })
      .returning({ id: exerciseSets.id });

    await tx.insert(questions).values(
      parsed.soal.map((s, i) => ({
        exerciseSetId: set.id,
        nomor: i + 1,
        tipe: s.tipe,
        pertanyaan: s.pertanyaan,
        opsi: s.tipe === "pilihan_ganda" ? (s.opsi ?? []) : null,
        kunci: s.kunci,
        pembahasan: s.pembahasan,
      })),
    );

    return {
      exerciseSetId: set.id,
      judul,
      jumlah: parsed.soal.length,
    };
  });
}
