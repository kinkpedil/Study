/**
 * Data tiruan untuk Tutor AI Pribadi. Nanti diganti data server (tutor_sessions,
 * tutor_messages) + AI. Struktur menyerupai kontrak API.
 */

export const mapelTutor = [
  "Matematika",
  "IPA",
  "Fisika",
  "Biologi",
  "Bahasa Indonesia",
  "Bahasa Inggris",
  "IPS",
];

export interface TutorSession {
  id: string;
  judul: string;
  mapel: string;
  cuplikan: string;
  timeAgo: string;
  jumlahPesan: number;
}

export const tutorSessions: TutorSession[] = [
  {
    id: "ts_1",
    judul: "Memahami pecahan senilai",
    mapel: "Matematika",
    cuplikan: "Kenapa 1/2 sama dengan 2/4?",
    timeAgo: "kemarin",
    jumlahPesan: 8,
  },
  {
    id: "ts_2",
    judul: "Fotosintesis pada tumbuhan",
    mapel: "IPA",
    cuplikan: "Bagaimana tumbuhan membuat makanannya?",
    timeAgo: "3 hari lalu",
    jumlahPesan: 12,
  },
  {
    id: "ts_3",
    judul: "Present continuous tense",
    mapel: "Bahasa Inggris",
    cuplikan: "Kapan pakai am/is/are + Ving?",
    timeAgo: "1 minggu lalu",
    jumlahPesan: 6,
  },
];

/** Topik cepat untuk memulai sesi. */
export const topikCepat = [
  { mapel: "Matematika", topik: "Bantu aku memahami pecahan" },
  { mapel: "IPA", topik: "Jelaskan siklus air" },
  { mapel: "Bahasa Indonesia", topik: "Cara membuat kalimat efektif" },
  { mapel: "Fisika", topik: "Apa itu gaya gesek?" },
];

export type RekomendasiTipe = "materi" | "latihan" | "video";

export interface Rekomendasi {
  id: string;
  judul: string;
  mapel: string;
  tipe: RekomendasiTipe;
  alasan: string;
  href: string;
}

export const rekomendasiTutor: Rekomendasi[] = [
  {
    id: "rk_1",
    judul: "Latihan Pecahan Kelas 8",
    mapel: "Matematika",
    tipe: "latihan",
    alasan: "Nilai pecahanmu masih 65% — latih lagi biar makin paham.",
    href: "/latihan/baru",
  },
  {
    id: "rk_2",
    judul: "Materi Sistem Pencernaan",
    mapel: "IPA",
    tipe: "materi",
    alasan: "Melanjutkan topik yang kamu tanyakan minggu lalu.",
    href: "/perpustakaan",
  },
  {
    id: "rk_3",
    judul: "Latihan Teks Deskripsi",
    mapel: "Bahasa Indonesia",
    tipe: "latihan",
    alasan: "Perkuat menulis setelah nilai bagusmu (91%).",
    href: "/latihan/baru",
  },
];

export function getTutorSession(id: string): TutorSession | undefined {
  return tutorSessions.find((s) => s.id === id);
}

export interface TutorMessage {
  id: string;
  sender: "siswa" | "ai";
  isi: string;
}

const transkrip: Record<string, TutorMessage[]> = {
  ts_1: [
    { id: "m1", sender: "siswa", isi: "Kenapa 1/2 sama dengan 2/4?" },
    {
      id: "m2",
      sender: "ai",
      isi: "Pertanyaan bagus! Bayangkan sebuah pizza. Kalau dipotong jadi 2 dan kamu ambil 1 potong, kamu punya 1/2. Kalau pizza yang sama dipotong jadi 4 dan kamu ambil 2 potong, jumlah pizzanya sama, kan? Itu sebabnya 1/2 = 2/4.",
    },
    { id: "m3", sender: "siswa", isi: "Oh berarti tinggal dikali 2 ya?" },
    {
      id: "m4",
      sender: "ai",
      isi: "Tepat sekali! Kalau pembilang dan penyebut sama-sama dikali angka yang sama, nilainya tetap. Mau coba satu soal bareng?",
    },
  ],
};

export function getTutorMessages(id: string): TutorMessage[] {
  return transkrip[id] ?? [];
}

/** Balasan tutor tiruan (aman & ramah) untuk pertanyaan siswa. */
export function balasanTutorMock(pertanyaan: string): string {
  const t = pertanyaan.trim();
  return `Ide yang bagus untuk ditanyakan! Yuk kita pahami "${t.length > 60 ? t.slice(0, 57) + "…" : t}" pelan-pelan. Coba ceritakan dulu bagian mana yang paling membingungkan buatmu, biar aku bisa bantu langkah demi langkah dengan contoh sederhana.`;
}
