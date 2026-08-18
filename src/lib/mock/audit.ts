/**
 * Data tiruan catatan aktivitas (audit log) admin sekolah. Nanti diganti tabel
 * audit_logs di backend. Mencatat aksi penting untuk akuntabilitas & keamanan.
 */

export type AuditKategori =
  | "pengguna"
  | "moderasi"
  | "forum"
  | "keamanan"
  | "sistem";

export interface AuditLog {
  id: string;
  aktor: string;
  aksi: string;
  kategori: AuditKategori;
  target?: string;
  waktu: string;
  timeAgo: string;
}

export const kategoriLabel: Record<AuditKategori, string> = {
  pengguna: "Pengguna",
  moderasi: "Moderasi",
  forum: "Forum",
  keamanan: "Keamanan",
  sistem: "Sistem",
};

export const auditLogs: AuditLog[] = [
  {
    id: "au1",
    aktor: "Ibu Rina Wijaya",
    aksi: "Mengangkat moderator forum",
    kategori: "moderasi",
    target: "Pak Bagus Santoso",
    waktu: "18 Agu 2026, 09:12",
    timeAgo: "1 jam lalu",
  },
  {
    id: "au2",
    aktor: "Sistem",
    aksi: "Menandai 2 konten oleh moderasi AI",
    kategori: "moderasi",
    target: "Forum SMP",
    waktu: "18 Agu 2026, 08:40",
    timeAgo: "2 jam lalu",
  },
  {
    id: "au3",
    aktor: "Pak Bagus Santoso",
    aksi: "Membuat pengumuman sekolah",
    kategori: "forum",
    target: "Ujian Tengah Semester",
    waktu: "18 Agu 2026, 07:55",
    timeAgo: "3 jam lalu",
  },
  {
    id: "au4",
    aktor: "Ibu Rina Wijaya",
    aksi: "Menyetujui pendaftaran guru baru",
    kategori: "pengguna",
    target: "Bu Sari Melati",
    waktu: "17 Agu 2026, 16:20",
    timeAgo: "kemarin",
  },
  {
    id: "au5",
    aktor: "Ibu Rina Wijaya",
    aksi: "Mengatur ulang kata sandi pengguna",
    kategori: "keamanan",
    target: "Siswa kelas 8B",
    waktu: "17 Agu 2026, 14:05",
    timeAgo: "kemarin",
  },
  {
    id: "au6",
    aktor: "Sistem",
    aksi: "Menonaktifkan akun tidak aktif",
    kategori: "sistem",
    target: "3 akun",
    waktu: "16 Agu 2026, 02:00",
    timeAgo: "2 hari lalu",
  },
];
