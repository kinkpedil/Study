/**
 * Data tiruan untuk Generator Latihan Soal — opsi parameter yang saling
 * bergantung (jenjang → kelas & mapel → topik). Nanti diganti data dari
 * server/AI. Bentuk data dibuat menyerupai kontrak API yang direncanakan.
 */

import type { Jenjang } from "./beranda";

export const jenjangList: Jenjang[] = ["SD", "SMP", "SMA"];

export const kelasByJenjang: Record<Jenjang, string[]> = {
  SD: ["1", "2", "3", "4", "5", "6"],
  SMP: ["7", "8", "9"],
  SMA: ["10", "11", "12"],
};

export const mapelByJenjang: Record<Jenjang, string[]> = {
  SD: ["Matematika", "IPA", "Bahasa Indonesia", "IPS", "PPKn"],
  SMP: ["Matematika", "IPA", "Bahasa Indonesia", "IPS", "Bahasa Inggris"],
  SMA: [
    "Matematika",
    "Fisika",
    "Kimia",
    "Biologi",
    "Bahasa Indonesia",
    "Bahasa Inggris",
    "Ekonomi",
  ],
};

/** Topik contoh per mapel; fallback ke daftar umum bila tidak terdaftar. */
export const topikByMapel: Record<string, string[]> = {
  Matematika: [
    "Bilangan Bulat",
    "Pecahan",
    "Aljabar",
    "Persamaan Linear",
    "Bangun Datar",
    "Statistika",
  ],
  IPA: [
    "Sistem Pencernaan",
    "Gaya dan Gerak",
    "Ekosistem",
    "Zat dan Perubahannya",
  ],
  Fisika: ["Kinematika", "Hukum Newton", "Usaha dan Energi", "Listrik"],
  "Bahasa Indonesia": [
    "Teks Deskripsi",
    "Teks Prosedur",
    "Puisi",
    "Kalimat Efektif",
  ],
};

export const topikUmum = ["Campuran (semua topik)"];

export function topikForMapel(mapel: string): string[] {
  return [...topikUmum, ...(topikByMapel[mapel] ?? [])];
}

export type Kesulitan = "mudah" | "sedang" | "sulit";

export const kesulitanList: { value: Kesulitan; label: string; desc: string }[] =
  [
    { value: "mudah", label: "Mudah", desc: "Dasar & pemahaman" },
    { value: "sedang", label: "Sedang", desc: "Penerapan" },
    { value: "sulit", label: "Sulit", desc: "Analisis & HOTS" },
  ];

export type TipeSoal = "pilihan_ganda" | "esai" | "campuran";

export const tipeSoalList: { value: TipeSoal; label: string }[] = [
  { value: "pilihan_ganda", label: "Pilihan Ganda" },
  { value: "esai", label: "Esai" },
  { value: "campuran", label: "Campuran" },
];

export const jumlahSoalOptions = [5, 10, 15, 20];

export interface LatihanParams {
  jenjang: Jenjang;
  kelas: string;
  mapel: string;
  topik: string;
  kesulitan: Kesulitan;
  tipe: TipeSoal;
  jumlah: number;
}

export const defaultParams: LatihanParams = {
  jenjang: "SMP",
  kelas: "8",
  mapel: "Matematika",
  topik: "Campuran (semua topik)",
  kesulitan: "sedang",
  tipe: "pilihan_ganda",
  jumlah: 10,
};
