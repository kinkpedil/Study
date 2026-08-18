import "server-only";

import { z } from "zod";

import { chatJson } from "@/lib/ai/provider";
import { moderasiKonten } from "@/server/moderasi-ai";

/**
 * Filter keselamatan untuk Tutor AI Pribadi — perlindungan data anak.
 *
 * Dua lapis:
 * 1. Deteksi topik berisiko pada PESAN SISWA (keselamatan diri, kekerasan,
 *    konten dewasa, perundungan, data pribadi) → tutor tidak menjawab seperti
 *    biasa, melainkan memberi tanggapan aman & mengarahkan ke orang dewasa.
 * 2. Filter RESPONS AI sebelum sampai ke siswa → bila balasan model lolos dari
 *    instruksi keamanan, diganti tanggapan aman.
 *
 * Lapisan kata kunci bersifat deterministik (selalu jalan, tidak tergantung
 * jaringan); klasifikasi AI menambah nuansa dan fail-open bila layanan mati.
 */

export type RisikoKategori =
  | "keselamatan_diri"
  | "kekerasan"
  | "konten_dewasa"
  | "perundungan"
  | "data_pribadi";

export interface HasilRisiko {
  berisiko: boolean;
  kategori: RisikoKategori | null;
  /** Tanggapan aman untuk ditampilkan menggantikan jawaban tutor. */
  pesanAman: string;
  /** Sarankan meneruskan ke guru/orang dewasa tepercaya. */
  eskalasi: boolean;
}

const kamusRisiko: { kategori: RisikoKategori; kata: string[] }[] = [
  {
    kategori: "keselamatan_diri",
    kata: [
      "bunuh diri",
      "menyakiti diri",
      "melukai diri",
      "mengakhiri hidup",
      "tidak ingin hidup",
      "ingin mati",
    ],
  },
  {
    kategori: "kekerasan",
    kata: ["memukul", "senjata", "menyakiti orang", "berkelahi", "mengancam"],
  },
  {
    kategori: "konten_dewasa",
    kata: ["pornografi", "konten dewasa", "video porno"],
  },
  {
    kategori: "perundungan",
    kata: ["dibully", "diejek", "diintimidasi", "dirundung", "diancam teman"],
  },
  {
    kategori: "data_pribadi",
    kata: ["alamat rumah", "nomor hp", "nomor telepon", "kata sandi", "password"],
  },
];

const rincianRisiko: Record<RisikoKategori, { pesan: string; eskalasi: boolean }> = {
  keselamatan_diri: {
    pesan:
      "Sepertinya kamu sedang menghadapi hal yang berat, dan aku peduli. Aku bukan pengganti bantuan sungguhan — tolong bicara dengan orang dewasa yang kamu percaya, atau hubungi Sejiwa di 119 ext 8 (24 jam, gratis). Kamu tidak sendirian.",
    eskalasi: true,
  },
  kekerasan: {
    pesan:
      "Kalau kamu atau temanmu dalam bahaya, segera beri tahu guru, orang tua, atau orang dewasa tepercaya. Aku bisa membantu meneruskan sesi ini ke gurumu.",
    eskalasi: true,
  },
  konten_dewasa: {
    pesan:
      "Maaf, aku tidak bisa membahas topik ini. Yuk kita kembali ke materi pelajaran. Kalau ada yang mengganggumu, cerita ke orang dewasa yang kamu percaya, ya.",
    eskalasi: false,
  },
  perundungan: {
    pesan:
      "Diejek atau dirundung itu tidak boleh dibiarkan, dan itu bukan salahmu. Ceritakan ke gurumu atau orang tua agar bisa dibantu. Aku bisa meneruskan sesi ini ke gurumu bila kamu mau.",
    eskalasi: true,
  },
  data_pribadi: {
    pesan:
      "Jaga data pribadimu, ya. Jangan bagikan alamat, nomor telepon, atau kata sandi ke siapa pun secara online, termasuk ke aku. Kalau ada yang memintanya, beri tahu orang dewasa tepercaya.",
    eskalasi: false,
  },
};

function cocokKamus(teks: string): RisikoKategori | null {
  const t = teks.toLowerCase();
  for (const { kategori, kata } of kamusRisiko) {
    if (kata.some((k) => t.includes(k))) return kategori;
  }
  return null;
}

const aiRisikoSchema = z.object({
  kategori: z.enum([
    "aman",
    "keselamatan_diri",
    "kekerasan",
    "konten_dewasa",
    "perundungan",
    "data_pribadi",
  ]),
});

/** Klasifikasi AI untuk nuansa yang lolos kata kunci; fail-open → null. */
async function klasifikasiAi(teks: string): Promise<RisikoKategori | null> {
  try {
    const raw = await chatJson<unknown>(
      [
        {
          role: "system",
          content:
            "Kamu penjaga keselamatan anak pada tutor belajar Indonesia. " +
            "Klasifikasikan PESAN SISWA ke salah satu: aman, keselamatan_diri, " +
            "kekerasan, konten_dewasa, perundungan, data_pribadi. Pilih kategori " +
            'risiko hanya bila jelas. Balas HANYA JSON {"kategori": "..."}.',
        },
        { role: "user", content: teks.slice(0, 2000) },
      ],
      { temperature: 0 },
    );
    const kategori = aiRisikoSchema.parse(raw).kategori;
    return kategori === "aman" ? null : kategori;
  } catch {
    return null;
  }
}

/**
 * Memeriksa pesan siswa terhadap topik berisiko. Kata kunci diperiksa lebih
 * dulu (deterministik); bila aman, klasifikasi AI dijalankan untuk nuansa.
 */
export async function periksaRisikoSiswa(teks: string): Promise<HasilRisiko> {
  const kategori = cocokKamus(teks) ?? (await klasifikasiAi(teks));
  if (!kategori) {
    return { berisiko: false, kategori: null, pesanAman: "", eskalasi: false };
  }
  const r = rincianRisiko[kategori];
  return { berisiko: true, kategori, pesanAman: r.pesan, eskalasi: r.eskalasi };
}

const PESAN_AMAN_DEFAULT =
  "Maaf, aku tidak bisa membahas itu. Yuk kita kembali ke materi belajar. Ada bagian pelajaran yang ingin kamu pahami?";

export interface HasilFilterRespons {
  aman: boolean;
  teks: string;
}

/**
 * Menyaring RESPONS AI sebelum sampai ke siswa. Bila balasan model terdeteksi
 * tidak aman (lolos dari instruksi sistem), diganti tanggapan aman default.
 */
export async function filterResponsAi(teks: string): Promise<HasilFilterRespons> {
  const hasil = await moderasiKonten(teks);
  if (hasil.tindakan === "blokir") {
    return { aman: false, teks: PESAN_AMAN_DEFAULT };
  }
  return { aman: true, teks };
}
