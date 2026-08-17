/**
 * Data tiruan untuk Ruang Diskusi & Forum. Nanti diganti data dari server
 * (forum_threads, forum_posts, school_forums). Struktur menyerupai kontrak API.
 */

import type { Jenjang } from "./beranda";

export type ForumScope = "jenjang" | "umum" | "sekolah";

export interface ForumThread {
  id: string;
  scope: ForumScope;
  /** Untuk scope "jenjang": jenjang audiens. null untuk umum/sekolah. */
  jenjang: Jenjang | null;
  kategori: string;
  judul: string;
  cuplikan: string;
  penulis: string;
  penulisRole: "siswa" | "guru" | "admin";
  balasan: number;
  dilihat: number;
  timeAgo: string;
  disematkan?: boolean;
}

export const kategoriForum = [
  "Umum",
  "Matematika",
  "IPA",
  "Bahasa",
  "Tips Belajar",
  "Pengumuman",
];

export const forumThreads: ForumThread[] = [
  {
    id: "th_1",
    scope: "jenjang",
    jenjang: "SMP",
    kategori: "Matematika",
    judul: "Cara cepat memahami persamaan linear satu variabel?",
    cuplikan:
      "Aku masih bingung membedakan langkah memindahkan ruas. Ada tips?",
    penulis: "Aisyah Putri",
    penulisRole: "siswa",
    balasan: 8,
    dilihat: 124,
    timeAgo: "2 jam lalu",
  },
  {
    id: "th_2",
    scope: "jenjang",
    jenjang: "SMP",
    kategori: "Tips Belajar",
    judul: "Bagaimana cara menghafal rumus dengan mudah?",
    cuplikan: "Punya trik menghafal rumus fisika/matematika yang nempel?",
    penulis: "Budi Hartono",
    penulisRole: "siswa",
    balasan: 15,
    dilihat: 342,
    timeAgo: "kemarin",
    disematkan: true,
  },
  {
    id: "th_3",
    scope: "umum",
    jenjang: null,
    kategori: "Tips Belajar",
    judul: "Rutinitas belajar yang efektif menurut kalian?",
    cuplikan: "Diskusi lintas jenjang: bagaimana kalian mengatur waktu belajar?",
    penulis: "Pak Bagus Santoso",
    penulisRole: "guru",
    balasan: 27,
    dilihat: 890,
    timeAgo: "3 hari lalu",
  },
  {
    id: "th_4",
    scope: "umum",
    jenjang: null,
    kategori: "Bahasa",
    judul: "Rekomendasi buku bacaan untuk menambah kosakata",
    cuplikan: "Bagikan judul buku favoritmu yang memperkaya kosakata.",
    penulis: "Citra Dewi",
    penulisRole: "siswa",
    balasan: 12,
    dilihat: 410,
    timeAgo: "4 hari lalu",
  },
  {
    id: "th_5",
    scope: "sekolah",
    jenjang: null,
    kategori: "Pengumuman",
    judul: "Ujian Tengah Semester dimulai 25 Agustus 2026",
    cuplikan:
      "Jadwal lengkap UTS dapat dilihat di lampiran. Harap dipersiapkan.",
    penulis: "Ibu Rina Wijaya",
    penulisRole: "admin",
    balasan: 3,
    dilihat: 512,
    timeAgo: "5 jam lalu",
    disematkan: true,
  },
  {
    id: "th_6",
    scope: "sekolah",
    jenjang: null,
    kategori: "Umum",
    judul: "Usulan kegiatan class meeting akhir semester",
    cuplikan: "Ada usulan lomba atau kegiatan untuk class meeting nanti?",
    penulis: "Dimas Prasetyo",
    penulisRole: "siswa",
    balasan: 19,
    dilihat: 233,
    timeAgo: "2 hari lalu",
  },
];

export const scopeLabel: Record<ForumScope, string> = {
  jenjang: "Jenjang Saya",
  umum: "Forum Umum",
  sekolah: "Forum Sekolah",
};

export const scopeDeskripsi: Record<ForumScope, string> = {
  jenjang: "Diskusi hanya dengan siswa dari jenjang yang sama.",
  umum: "Diskusi terbuka lintas jenjang bersama siswa dan guru.",
  sekolah: "Ruang internal sekolahmu: pengumuman & diskusi.",
};
