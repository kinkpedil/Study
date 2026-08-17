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
  /** Jenjang penulis — ditampilkan di forum umum untuk menandai lintas jenjang. */
  penulisJenjang?: Jenjang | "Guru";
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
    penulisJenjang: "Guru",
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
    penulisJenjang: "SMA",
    balasan: 12,
    dilihat: 410,
    timeAgo: "4 hari lalu",
  },
  {
    id: "th_7",
    scope: "umum",
    jenjang: null,
    kategori: "IPA",
    judul: "Eksperimen sains sederhana yang seru di rumah",
    cuplikan: "Anak SD sampai SMA boleh ikut berbagi eksperimen favorit!",
    penulis: "Kenzie Alfaro",
    penulisRole: "siswa",
    penulisJenjang: "SD",
    balasan: 21,
    dilihat: 654,
    timeAgo: "6 jam lalu",
  },
  {
    id: "th_8",
    scope: "umum",
    jenjang: null,
    kategori: "Umum",
    judul: "Bagaimana menghadapi rasa cemas sebelum ujian?",
    cuplikan: "Diskusi terbuka: berbagi cara mengelola kecemasan menjelang ujian.",
    penulis: "Bu Sari Melati",
    penulisRole: "guru",
    penulisJenjang: "Guru",
    balasan: 34,
    dilihat: 1203,
    timeAgo: "1 hari lalu",
    disematkan: true,
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

export interface ForumReply {
  id: string;
  threadId: string;
  penulis: string;
  penulisRole: "siswa" | "guru" | "admin";
  /** Jenjang penulis — ditampilkan di forum umum/sekolah (lintas jenjang). */
  penulisJenjang?: Jenjang | "Guru";
  isi: string;
  timeAgo: string;
}

/** Isi lengkap thread (fallback ke cuplikan bila tak ada). */
export const threadBodies: Record<string, string> = {
  th_1: "Halo teman-teman! Aku masih sering keliru saat memindahkan ruas pada persamaan linear, misalnya 2x + 3 = 11. Kadang tanda plus-minusnya kebalik. Ada cara mengingat langkahnya biar tidak salah?",
  th_2: "Aku merasa hafalan rumus cepat hilang. Adakah trik seperti jembatan keledai atau cara memahami asal rumusnya supaya lebih nempel?",
};

export const forumReplies: Record<string, ForumReply[]> = {
  th_1: [
    {
      id: "rp_1",
      threadId: "th_1",
      penulis: "Budi Hartono",
      penulisRole: "siswa",
      isi: "Ingat aja: kalau pindah ruas, tandanya berubah. +3 di kiri jadi −3 di kanan. Jadi 2x = 11 − 3 = 8, lalu x = 4.",
      timeAgo: "1 jam lalu",
    },
    {
      id: "rp_2",
      threadId: "th_1",
      penulis: "Pak Bagus Santoso",
      penulisRole: "guru",
      isi: "Betul, Budi. Kuncinya: operasi yang sama dilakukan di kedua ruas. Coba bayangkan timbangan yang harus tetap seimbang.",
      timeAgo: "40 menit lalu",
    },
  ],
  th_2: [
    {
      id: "rp_3",
      threadId: "th_2",
      penulis: "Citra Dewi",
      penulisRole: "siswa",
      isi: "Aku biasanya menulis ulang rumus sambil menyebutkan artinya. Lebih nempel daripada sekadar menghafal simbol.",
      timeAgo: "kemarin",
    },
  ],
  th_8: [
    {
      id: "rp_4",
      threadId: "th_8",
      penulis: "Kenzie Alfaro",
      penulisRole: "siswa",
      penulisJenjang: "SD",
      isi: "Aku suka tarik napas panjang beberapa kali sebelum mengerjakan soal. Jadi lebih tenang.",
      timeAgo: "20 jam lalu",
    },
    {
      id: "rp_5",
      threadId: "th_8",
      penulis: "Rangga Saputra",
      penulisRole: "siswa",
      penulisJenjang: "SMA",
      isi: "Buatku, belajar bertahap dari jauh-jauh hari mengurangi cemas mendekati ujian.",
      timeAgo: "18 jam lalu",
    },
    {
      id: "rp_6",
      threadId: "th_8",
      penulis: "Bu Sari Melati",
      penulisRole: "guru",
      penulisJenjang: "Guru",
      isi: "Bagus sekali, anak-anak. Ingat, cemas itu wajar. Fokus pada usaha, bukan hanya hasil.",
      timeAgo: "12 jam lalu",
    },
  ],
};

export function getThread(id: string): ForumThread | undefined {
  return forumThreads.find((t) => t.id === id);
}

export function getThreadBody(t: ForumThread): string {
  return threadBodies[t.id] ?? t.cuplikan;
}

export function getReplies(threadId: string): ForumReply[] {
  return forumReplies[threadId] ?? [];
}

export interface Pengumuman {
  id: string;
  judul: string;
  isi: string;
  penulis: string;
  timeAgo: string;
}

export const pengumumanSekolah: Pengumuman[] = [
  {
    id: "pg_1",
    judul: "Ujian Tengah Semester dimulai 25 Agustus 2026",
    isi: "Seluruh siswa diharapkan mempersiapkan diri. Jadwal lengkap dibagikan wali kelas masing-masing.",
    penulis: "Ibu Rina Wijaya",
    timeAgo: "5 jam lalu",
  },
  {
    id: "pg_2",
    judul: "Perpustakaan buka lebih lama selama pekan ujian",
    isi: "Mulai 20 Agustus, perpustakaan buka hingga pukul 17.00 untuk mendukung belajar.",
    penulis: "Ibu Rina Wijaya",
    timeAgo: "2 hari lalu",
  },
];

export type PengaduanVisibility = "privat" | "publik";
export type PengaduanStatus = "baru" | "diproses" | "selesai";

export interface Pengaduan {
  id: string;
  judul: string;
  ringkas: string;
  visibility: PengaduanVisibility;
  status: PengaduanStatus;
  pelapor: string;
  timeAgo: string;
}

export const pengaduanSekolah: Pengaduan[] = [
  {
    id: "pd_1",
    judul: "AC di kelas 8B mati",
    ringkas: "Sudah dua hari AC tidak menyala, kelas terasa panas saat siang.",
    visibility: "publik",
    status: "diproses",
    pelapor: "Aisyah Putri",
    timeAgo: "kemarin",
  },
  {
    id: "pd_2",
    judul: "Masalah pribadi dengan teman sekelas",
    ringkas: "Butuh bantuan guru BK untuk menyelesaikan perselisihan.",
    visibility: "privat",
    status: "baru",
    pelapor: "Anonim",
    timeAgo: "3 jam lalu",
  },
  {
    id: "pd_3",
    judul: "Kran wastafel bocor di lantai 2",
    ringkas: "Air terus menetes dan membuat lantai licin.",
    visibility: "publik",
    status: "selesai",
    pelapor: "Dimas Prasetyo",
    timeAgo: "1 minggu lalu",
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
