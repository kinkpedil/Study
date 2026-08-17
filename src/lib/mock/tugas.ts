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
