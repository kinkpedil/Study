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

export type EskalasiStatus = "baru" | "ditangani";

export interface EskalasiGuru {
  id: string;
  siswa: string;
  jenjang: string;
  mapel: string;
  judul: string;
  catatan: string;
  timeAgo: string;
  status: EskalasiStatus;
}

export const eskalasiGuru: EskalasiGuru[] = [
  {
    id: "es_1",
    siswa: "Aisyah Putri",
    jenjang: "SMP",
    mapel: "Matematika",
    judul: "Memahami pecahan senilai",
    catatan: "Aku masih bingung kenapa harus dikali angka yang sama.",
    timeAgo: "30 menit lalu",
    status: "baru",
  },
  {
    id: "es_2",
    siswa: "Budi Hartono",
    jenjang: "SMP",
    mapel: "Fisika",
    judul: "Gaya gesek pada bidang miring",
    catatan: "Tutor sudah jelaskan tapi aku masih belum paham rumusnya.",
    timeAgo: "2 jam lalu",
    status: "baru",
  },
  {
    id: "es_3",
    siswa: "Citra Dewi",
    jenjang: "SMP",
    mapel: "Bahasa Indonesia",
    judul: "Menyusun paragraf argumentasi",
    catatan: "Minta contoh paragraf argumentasi yang baik.",
    timeAgo: "kemarin",
    status: "ditangani",
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

/**
 * Kategori topik berisiko yang butuh penanganan khusus (bukan dijawab tutor).
 * Deteksi asli dilakukan moderasi AI di server; ini hanya pratinjau UI.
 */
export type KategoriRisiko =
  | "keselamatan-diri"
  | "kekerasan"
  | "konten-dewasa"
  | "perundungan"
  | "data-pribadi";

export interface TopikBerisiko {
  kategori: KategoriRisiko;
  judul: string;
  pesan: string;
  /** Sarankan meneruskan ke guru/orang dewasa tepercaya. */
  eskalasi: boolean;
}

const kamusRisiko: { kategori: KategoriRisiko; kata: string[] }[] = [
  {
    kategori: "keselamatan-diri",
    kata: ["bunuh diri", "menyakiti diri", "mengakhiri hidup", "tidak ingin hidup", "melukai diri"],
  },
  {
    kategori: "kekerasan",
    kata: ["memukul", "senjata", "menyakiti orang", "berkelahi", "mengancam"],
  },
  {
    kategori: "konten-dewasa",
    kata: ["seks", "pornografi", "konten dewasa"],
  },
  {
    kategori: "perundungan",
    kata: ["dibully", "diejek", "diintimidasi", "dirundung", "diancam teman"],
  },
  {
    kategori: "data-pribadi",
    kata: ["alamat rumah", "nomor hp", "nomor telepon", "kata sandi", "password"],
  },
];

const rincianRisiko: Record<KategoriRisiko, Omit<TopikBerisiko, "kategori">> = {
  "keselamatan-diri": {
    judul: "Kamu tidak sendirian",
    pesan:
      "Sepertinya kamu sedang menghadapi hal yang berat. Aku bukan pengganti bantuan sungguhan — tolong bicara dengan orang dewasa yang kamu percaya, atau hubungi Sejiwa di 119 ext 8 (24 jam, gratis).",
    eskalasi: true,
  },
  kekerasan: {
    judul: "Ini butuh bantuan orang dewasa",
    pesan:
      "Kalau kamu atau temanmu dalam bahaya, segera beri tahu guru, orang tua, atau orang dewasa tepercaya. Aku bisa bantu meneruskan sesi ini ke gurumu.",
    eskalasi: true,
  },
  "konten-dewasa": {
    judul: "Topik ini tidak untuk tutor belajar",
    pesan:
      "Maaf, aku tidak bisa membahas topik ini. Yuk kita kembali ke materi pelajaran. Kalau ada yang mengganggumu, cerita ke orang dewasa yang kamu percaya, ya.",
    eskalasi: false,
  },
  perundungan: {
    judul: "Terima kasih sudah cerita",
    pesan:
      "Diejek atau dirundung itu tidak boleh dibiarkan, dan itu bukan salahmu. Ceritakan ke gurumu atau orang tua agar bisa dibantu. Aku bisa meneruskan sesi ini ke gurumu bila kamu mau.",
    eskalasi: true,
  },
  "data-pribadi": {
    judul: "Jaga data pribadimu",
    pesan:
      "Jangan bagikan alamat, nomor telepon, atau kata sandi ke siapa pun secara online, termasuk ke aku. Kalau ada yang memintanya, beri tahu orang dewasa tepercaya.",
    eskalasi: false,
  },
};

/** Deteksi topik berisiko sederhana (pratinjau); null jika aman. */
export function deteksiTopikBerisiko(pertanyaan: string): TopikBerisiko | null {
  const t = pertanyaan.toLowerCase();
  for (const { kategori, kata } of kamusRisiko) {
    if (kata.some((k) => t.includes(k))) {
      return { kategori, ...rincianRisiko[kategori] };
    }
  }
  return null;
}

/** Balasan tutor tiruan (aman & ramah) untuk pertanyaan siswa. */
export function balasanTutorMock(pertanyaan: string): string {
  const t = pertanyaan.trim();
  return `Ide yang bagus untuk ditanyakan! Yuk kita pahami "${t.length > 60 ? t.slice(0, 57) + "…" : t}" pelan-pelan. Coba ceritakan dulu bagian mana yang paling membingungkan buatmu, biar aku bisa bantu langkah demi langkah dengan contoh sederhana.`;
}
