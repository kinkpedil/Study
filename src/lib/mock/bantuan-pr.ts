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
  jumlahPetunjuk: number;
}

export const riwayatBantuan: HelpSession[] = [
  {
    id: "hs_1",
    judul: "Menyederhanakan pecahan aljabar",
    mapel: "Matematika",
    cuplikan: "Bagaimana menyederhanakan (x²−4)/(x+2)?",
    timeAgo: "kemarin",
    jumlahPetunjuk: 3,
  },
  {
    id: "hs_2",
    judul: "Hukum Newton pada bidang miring",
    mapel: "Fisika",
    cuplikan: "Kenapa benda bisa meluncur di bidang miring?",
    timeAgo: "3 hari lalu",
    jumlahPetunjuk: 4,
  },
  {
    id: "hs_3",
    judul: "Menentukan ide pokok paragraf",
    mapel: "Bahasa Indonesia",
    cuplikan: "Cara cepat menemukan ide pokok?",
    timeAgo: "1 minggu lalu",
    jumlahPetunjuk: 2,
  },
];

/** Contoh pertanyaan populer untuk mengisi komposer dengan cepat. */
export const contohPertanyaan = [
  "Bagaimana cara mencari KPK dan FPB?",
  "Jelaskan proses fotosintesis secara sederhana",
  "Apa perbedaan kalimat aktif dan pasif?",
];
