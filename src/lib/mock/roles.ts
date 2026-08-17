/**
 * Data tiruan untuk dashboard per peran (guru & admin sekolah).
 * Dashboard siswa memakai data di `beranda.ts`. Semua ini sementara sampai
 * backend/Supabase tersedia.
 */

import type { Jenjang } from "./beranda";

export type Role = "siswa" | "guru" | "admin";

export interface RoleProfile {
  name: string;
  role: Role;
  jenjang?: Jenjang;
  kelas?: string;
  school: string;
}

export const roleProfiles: Record<Role, RoleProfile> = {
  siswa: {
    name: "Aisyah Putri",
    role: "siswa",
    jenjang: "SMP",
    kelas: "8B",
    school: "SMP Negeri 1 Cerdas",
  },
  guru: {
    name: "Pak Bagus Santoso",
    role: "guru",
    school: "SMP Negeri 1 Cerdas",
  },
  admin: {
    name: "Ibu Rina Wijaya",
    role: "admin",
    school: "SMP Negeri 1 Cerdas",
  },
};

/* ---------------------------- Guru ---------------------------- */

export interface GuruStat {
  label: string;
  value: string;
}

export const guruStats: GuruStat[] = [
  { label: "Kelas diampu", value: "4" },
  { label: "Tugas aktif", value: "6" },
  { label: "Perlu dinilai", value: "23" },
  { label: "Siswa", value: "128" },
];

export interface KelasRingkas {
  id: string;
  nama: string;
  mapel: string;
  jumlahSiswa: number;
  tugasAktif: number;
}

export const guruKelas: KelasRingkas[] = [
  { id: "k1", nama: "Kelas 8A", mapel: "Matematika", jumlahSiswa: 32, tugasAktif: 2 },
  { id: "k2", nama: "Kelas 8B", mapel: "Matematika", jumlahSiswa: 30, tugasAktif: 1 },
  { id: "k3", nama: "Kelas 9A", mapel: "Matematika", jumlahSiswa: 33, tugasAktif: 2 },
  { id: "k4", nama: "Kelas 9C", mapel: "Matematika", jumlahSiswa: 33, tugasAktif: 1 },
];

export interface PengumpulanTugas {
  id: string;
  siswa: string;
  tugas: string;
  kelas: string;
  timeAgo: string;
  status: "baru" | "terlambat";
}

export const guruPengumpulan: PengumpulanTugas[] = [
  { id: "p1", siswa: "Dewi Lestari", tugas: "Latihan Persamaan Linear", kelas: "8B", timeAgo: "10 menit lalu", status: "baru" },
  { id: "p2", siswa: "Rizky Pratama", tugas: "Latihan Persamaan Linear", kelas: "8B", timeAgo: "1 jam lalu", status: "baru" },
  { id: "p3", siswa: "Siti Aminah", tugas: "Soal Cerita SPLDV", kelas: "9A", timeAgo: "3 jam lalu", status: "terlambat" },
  { id: "p4", siswa: "Bagas Nugroho", tugas: "Soal Cerita SPLDV", kelas: "9A", timeAgo: "kemarin", status: "baru" },
];

/* ---------------------------- Admin ---------------------------- */

export interface AdminStat {
  label: string;
  value: string;
}

export const adminStats: AdminStat[] = [
  { label: "Pengguna", value: "1.204" },
  { label: "Guru aktif", value: "48" },
  { label: "Laporan terbuka", value: "7" },
  { label: "Forum sekolah", value: "5" },
];

export interface LaporanRingkas {
  id: string;
  target: string;
  alasan: string;
  timeAgo: string;
  status: "menunggu" | "ditinjau";
}

export const adminLaporan: LaporanRingkas[] = [
  { id: "l1", target: "Postingan forum SMP", alasan: "Bahasa kasar", timeAgo: "20 menit lalu", status: "menunggu" },
  { id: "l2", target: "Komentar forum umum", alasan: "Spam", timeAgo: "2 jam lalu", status: "menunggu" },
  { id: "l3", target: "Pengajuan masalah", alasan: "Perundungan", timeAgo: "5 jam lalu", status: "ditinjau" },
];

export interface AuditEntry {
  id: string;
  aktor: string;
  aksi: string;
  timeAgo: string;
}

export const adminAudit: AuditEntry[] = [
  { id: "a1", aktor: "Pak Bagus", aksi: "Membuat pengumuman sekolah", timeAgo: "1 jam lalu" },
  { id: "a2", aktor: "Ibu Rina", aksi: "Mengangkat moderator forum", timeAgo: "3 jam lalu" },
  { id: "a3", aktor: "Sistem", aksi: "Menandai 2 konten oleh moderasi AI", timeAgo: "kemarin" },
];
