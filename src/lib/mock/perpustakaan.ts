/**
 * Data buku tiruan untuk Perpustakaan Digital. Metadata meniru sumber resmi
 * Kemendikbud (buku.kemendikdasmen.go.id) — hanya metadata + tautan sumber,
 * tanpa menyalin isi berhak cipta. Nanti diganti data dari integrasi resmi.
 */

import type { Jenjang } from "./beranda";

export type KategoriBuku = "Buku Teks" | "Buku Cerita" | "Modul" | "Referensi";

export interface Buku {
  id: string;
  judul: string;
  penulis: string;
  jenjang: Jenjang;
  kelas: string;
  mapel: string;
  kategori: KategoriBuku;
  tahun: number;
  deskripsi: string;
  /** Tautan ke sumber resmi. */
  sumberUrl: string;
  penerbit: string;
}

export const daftarBuku: Buku[] = [
  {
    id: "bk_1",
    judul: "Matematika untuk SMP/MTs Kelas VIII",
    penulis: "Kemendikbudristek",
    jenjang: "SMP",
    kelas: "8",
    mapel: "Matematika",
    kategori: "Buku Teks",
    tahun: 2021,
    deskripsi:
      "Buku teks kurikulum untuk mendukung pembelajaran matematika kelas 8, mencakup aljabar, geometri, dan statistika.",
    sumberUrl: "https://buku.kemendikdasmen.go.id/",
    penerbit: "Pusat Kurikulum dan Perbukuan",
  },
  {
    id: "bk_2",
    judul: "Ilmu Pengetahuan Alam Kelas VIII",
    penulis: "Kemendikbudristek",
    jenjang: "SMP",
    kelas: "8",
    mapel: "IPA",
    kategori: "Buku Teks",
    tahun: 2021,
    deskripsi:
      "Materi IPA terpadu kelas 8: sistem tubuh manusia, gaya dan gerak, serta zat dan perubahannya.",
    sumberUrl: "https://buku.kemendikdasmen.go.id/",
    penerbit: "Pusat Kurikulum dan Perbukuan",
  },
  {
    id: "bk_3",
    judul: "Bahasa Indonesia Kelas VIII",
    penulis: "Kemendikbudristek",
    jenjang: "SMP",
    kelas: "8",
    mapel: "Bahasa Indonesia",
    kategori: "Buku Teks",
    tahun: 2021,
    deskripsi:
      "Panduan berbahasa Indonesia: teks deskripsi, prosedur, berita, dan puisi untuk kelas 8.",
    sumberUrl: "https://buku.kemendikdasmen.go.id/",
    penerbit: "Pusat Kurikulum dan Perbukuan",
  },
  {
    id: "bk_4",
    judul: "Kisah Si Kancil dan Teman-teman",
    penulis: "Balai Pustaka",
    jenjang: "SD",
    kelas: "3",
    mapel: "Bahasa Indonesia",
    kategori: "Buku Cerita",
    tahun: 2019,
    deskripsi:
      "Kumpulan cerita rakyat bergambar untuk menumbuhkan minat baca anak SD.",
    sumberUrl: "https://buku.kemendikdasmen.go.id/",
    penerbit: "Balai Pustaka",
  },
  {
    id: "bk_5",
    judul: "Matematika untuk SD/MI Kelas IV",
    penulis: "Kemendikbudristek",
    jenjang: "SD",
    kelas: "4",
    mapel: "Matematika",
    kategori: "Buku Teks",
    tahun: 2022,
    deskripsi:
      "Bilangan, pecahan, bangun datar, dan pengukuran untuk siswa kelas 4 SD.",
    sumberUrl: "https://buku.kemendikdasmen.go.id/",
    penerbit: "Pusat Kurikulum dan Perbukuan",
  },
  {
    id: "bk_6",
    judul: "Fisika untuk SMA/MA Kelas X",
    penulis: "Kemendikbudristek",
    jenjang: "SMA",
    kelas: "10",
    mapel: "Fisika",
    kategori: "Buku Teks",
    tahun: 2021,
    deskripsi:
      "Konsep kinematika, dinamika, dan energi sebagai dasar fisika SMA kelas 10.",
    sumberUrl: "https://buku.kemendikdasmen.go.id/",
    penerbit: "Pusat Kurikulum dan Perbukuan",
  },
  {
    id: "bk_7",
    judul: "Biologi untuk SMA/MA Kelas XI",
    penulis: "Kemendikbudristek",
    jenjang: "SMA",
    kelas: "11",
    mapel: "Biologi",
    kategori: "Buku Teks",
    tahun: 2022,
    deskripsi:
      "Struktur dan fungsi sel, jaringan, serta sistem organ pada makhluk hidup.",
    sumberUrl: "https://buku.kemendikdasmen.go.id/",
    penerbit: "Pusat Kurikulum dan Perbukuan",
  },
  {
    id: "bk_8",
    judul: "Modul Belajar Literasi Numerasi",
    penulis: "Pusmenjar",
    jenjang: "SMP",
    kelas: "7",
    mapel: "Matematika",
    kategori: "Modul",
    tahun: 2020,
    deskripsi:
      "Modul latihan literasi dan numerasi untuk menguatkan kemampuan dasar siswa.",
    sumberUrl: "https://buku.kemendikdasmen.go.id/",
    penerbit: "Pusat Asesmen dan Pembelajaran",
  },
];

export const kategoriList: KategoriBuku[] = [
  "Buku Teks",
  "Buku Cerita",
  "Modul",
  "Referensi",
];

export function getBuku(id: string): Buku | undefined {
  return daftarBuku.find((b) => b.id === id);
}
