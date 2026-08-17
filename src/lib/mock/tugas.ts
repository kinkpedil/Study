/**
 * Data contoh untuk Tugas & Penilaian. Nanti diganti data dari server
 * (assignments, submissions). Tanggal memakai ISO agar mudah dihitung.
 */

export type TugasStatus = "belum" | "terkumpul" | "dinilai" | "terlambat";
export type TugasTipe = "teks" | "file";

/** Perspektif siswa: tugas yang harus dikerjakan/sudah dikumpulkan. */
export interface TugasSiswa {
  id: string;
  judul: string;
  mapel: string;
  guru: string;
  tenggat: string; // ISO
  status: TugasStatus;
  tipe: TugasTipe;
  nilai?: number;
  deskripsi?: string;
  /** Umpan balik guru (jika sudah dinilai). */
  komentar?: string;
}

export const tugasSiswa: TugasSiswa[] = [
  {
    id: "tg_1",
    judul: "Latihan Persamaan Linear Satu Variabel",
    mapel: "Matematika",
    guru: "Pak Bagus Santoso",
    tenggat: "2026-08-18T23:59:00Z",
    status: "belum",
    tipe: "teks",
    deskripsi:
      "Kerjakan 10 soal persamaan linear satu variabel. Tuliskan langkah pengerjaannya, bukan hanya jawaban akhir.",
  },
  {
    id: "tg_2",
    judul: "Laporan Praktikum Sistem Pencernaan",
    mapel: "IPA",
    guru: "Bu Sari Melati",
    tenggat: "2026-08-20T23:59:00Z",
    status: "belum",
    tipe: "file",
  },
  {
    id: "tg_3",
    judul: "Menulis Teks Deskripsi",
    mapel: "Bahasa Indonesia",
    guru: "Bu Sari Melati",
    tenggat: "2026-08-15T23:59:00Z",
    status: "terkumpul",
    tipe: "teks",
  },
  {
    id: "tg_4",
    judul: "Kuis Aljabar Dasar",
    mapel: "Matematika",
    guru: "Pak Bagus Santoso",
    tenggat: "2026-08-12T23:59:00Z",
    status: "dinilai",
    tipe: "teks",
    nilai: 90,
    komentar: "Kerja bagus! Langkah pengerjaan sudah jelas. Pertahankan.",
  },
  {
    id: "tg_5",
    judul: "Rangkuman Bab Gaya dan Gerak",
    mapel: "IPA",
    guru: "Bu Sari Melati",
    tenggat: "2026-08-10T23:59:00Z",
    status: "terlambat",
    tipe: "file",
  },
];

/** Perspektif guru: tugas yang dibuat + progres pengumpulan. */
export interface TugasGuru {
  id: string;
  judul: string;
  mapel: string;
  kelas: string;
  tenggat: string;
  jumlahSiswa: number;
  terkumpul: number;
  perluDinilai: number;
}

export const tugasGuru: TugasGuru[] = [
  {
    id: "tgg_1",
    judul: "Latihan Persamaan Linear Satu Variabel",
    mapel: "Matematika",
    kelas: "8B",
    tenggat: "2026-08-18T23:59:00Z",
    jumlahSiswa: 32,
    terkumpul: 18,
    perluDinilai: 18,
  },
  {
    id: "tgg_2",
    judul: "Kuis Aljabar Dasar",
    mapel: "Matematika",
    kelas: "8A",
    tenggat: "2026-08-12T23:59:00Z",
    jumlahSiswa: 30,
    terkumpul: 30,
    perluDinilai: 5,
  },
  {
    id: "tgg_3",
    judul: "Proyek Statistika Sederhana",
    mapel: "Matematika",
    kelas: "9A",
    tenggat: "2026-08-25T23:59:00Z",
    jumlahSiswa: 28,
    terkumpul: 3,
    perluDinilai: 0,
  },
];

const statusMeta: Record<
  TugasStatus,
  { label: string; variant: "secondary" | "warning" | "success" | "destructive" }
> = {
  belum: { label: "Belum dikumpul", variant: "warning" },
  terkumpul: { label: "Menunggu nilai", variant: "secondary" },
  dinilai: { label: "Dinilai", variant: "success" },
  terlambat: { label: "Terlambat", variant: "destructive" },
};

export function statusTugas(status: TugasStatus) {
  return statusMeta[status];
}

/** Menghitung sisa waktu relatif terhadap `sekarang` (default: hari ini demo). */
export function sisaTenggat(
  tenggatIso: string,
  sekarang = new Date("2026-08-17T12:00:00Z"),
): { teks: string; mendesak: boolean; lewat: boolean } {
  const t = new Date(tenggatIso).getTime();
  const diffMs = t - sekarang.getTime();
  const hari = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffMs < 0) return { teks: "Tenggat lewat", mendesak: false, lewat: true };
  if (hari <= 0) return { teks: "Hari ini", mendesak: true, lewat: false };
  if (hari === 1) return { teks: "Besok", mendesak: true, lewat: false };
  return { teks: `${hari} hari lagi`, mendesak: hari <= 3, lewat: false };
}

export const mapelTugas = [
  "Matematika",
  "IPA",
  "Bahasa Indonesia",
  "Bahasa Inggris",
  "IPS",
  "PPKn",
];

export const kelasTugas = ["7A", "7B", "8A", "8B", "9A", "9B"];

export function formatTanggal(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Pengumpulan siswa untuk sebuah tugas (perspektif guru). */
export interface Pengumpulan {
  id: string;
  tugasId: string;
  siswa: string;
  waktu: string; // ISO
  tipe: TugasTipe;
  jawaban?: string;
  fileNama?: string;
  status: "perlu" | "dinilai";
  nilai?: number;
  komentar?: string;
}

export const pengumpulanTugas: Record<string, Pengumpulan[]> = {
  tgg_1: [
    {
      id: "sub_1",
      tugasId: "tgg_1",
      siswa: "Aisyah Putri",
      waktu: "2026-08-16T20:10:00Z",
      tipe: "teks",
      jawaban:
        "1) 2x + 3 = 11 → 2x = 8 → x = 4. 2) 5x − 10 = 0 → x = 2. …",
      status: "perlu",
    },
    {
      id: "sub_2",
      tugasId: "tgg_1",
      siswa: "Budi Hartono",
      waktu: "2026-08-16T21:35:00Z",
      tipe: "teks",
      jawaban: "1) x = 4. 2) x = 2. 3) x = -1. (tanpa langkah)",
      status: "perlu",
    },
    {
      id: "sub_3",
      tugasId: "tgg_1",
      siswa: "Citra Dewi",
      waktu: "2026-08-15T09:00:00Z",
      tipe: "teks",
      jawaban: "Semua soal dikerjakan lengkap dengan langkah.",
      status: "dinilai",
      nilai: 95,
      komentar: "Rapi dan lengkap. Bagus!",
    },
  ],
  tgg_2: [
    {
      id: "sub_4",
      tugasId: "tgg_2",
      siswa: "Dimas Prasetyo",
      waktu: "2026-08-11T18:00:00Z",
      tipe: "teks",
      jawaban: "Jawaban kuis aljabar dasar.",
      status: "perlu",
    },
  ],
};

export function getPengumpulan(tugasId: string): Pengumpulan[] {
  return pengumpulanTugas[tugasId] ?? [];
}

export function getTugasSiswa(id: string): TugasSiswa | undefined {
  return tugasSiswa.find((t) => t.id === id);
}

export function getTugasGuru(id: string): TugasGuru | undefined {
  return tugasGuru.find((t) => t.id === id);
}
