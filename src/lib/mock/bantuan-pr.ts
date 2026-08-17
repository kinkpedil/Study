/**
 * Data tiruan untuk fitur Bantuan PR. Nanti diganti data dari server
 * (homework_sessions & homework_messages) + AI.
 */

export const mapelBantuan = [
  "Matematika",
  "IPA",
  "Fisika",
  "Kimia",
  "Biologi",
  "Bahasa Indonesia",
  "Bahasa Inggris",
  "IPS",
  "Lainnya",
];

export interface HelpSession {
  id: string;
  judul: string;
  mapel: string;
  cuplikan: string;
  timeAgo: string;
  tanggal: string; // ISO
  jumlahPetunjuk: number;
  selesai: boolean;
}

export const riwayatBantuan: HelpSession[] = [
  {
    id: "hs_1",
    judul: "Menyederhanakan pecahan aljabar",
    mapel: "Matematika",
    cuplikan: "Bagaimana menyederhanakan (x²−4)/(x+2)?",
    timeAgo: "kemarin",
    tanggal: "2026-08-16T09:10:00Z",
    jumlahPetunjuk: 3,
    selesai: true,
  },
  {
    id: "hs_2",
    judul: "Hukum Newton pada bidang miring",
    mapel: "Fisika",
    cuplikan: "Kenapa benda bisa meluncur di bidang miring?",
    timeAgo: "3 hari lalu",
    tanggal: "2026-08-14T13:40:00Z",
    jumlahPetunjuk: 4,
    selesai: true,
  },
  {
    id: "hs_3",
    judul: "Menentukan ide pokok paragraf",
    mapel: "Bahasa Indonesia",
    cuplikan: "Cara cepat menemukan ide pokok?",
    timeAgo: "1 minggu lalu",
    tanggal: "2026-08-10T08:00:00Z",
    jumlahPetunjuk: 2,
    selesai: true,
  },
  {
    id: "hs_4",
    judul: "Reaksi asam dan basa",
    mapel: "Kimia",
    cuplikan: "Apa yang terjadi saat asam bertemu basa?",
    timeAgo: "1 minggu lalu",
    tanggal: "2026-08-09T15:20:00Z",
    jumlahPetunjuk: 3,
    selesai: false,
  },
  {
    id: "hs_5",
    judul: "Present perfect tense",
    mapel: "Bahasa Inggris",
    cuplikan: "Kapan memakai have/has + V3?",
    timeAgo: "2 minggu lalu",
    tanggal: "2026-08-03T10:05:00Z",
    jumlahPetunjuk: 2,
    selesai: true,
  },
];

/** Contoh pertanyaan populer untuk mengisi komposer dengan cepat. */
export const contohPertanyaan = [
  "Bagaimana cara mencari KPK dan FPB?",
  "Jelaskan proses fotosintesis secara sederhana",
  "Apa perbedaan kalimat aktif dan pasif?",
];
