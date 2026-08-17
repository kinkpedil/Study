import "server-only";

import { z } from "zod";

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
