/**
 * Data tiruan untuk halaman Akun & Keamanan. Nanti diganti data pengguna dari
 * Supabase Auth + profiles. Struktur menyerupai kontrak API.
 */

import type { Role } from "./roles";

export interface AkunProfil {
  nama: string;
  email: string;
  role: Role;
  jenjang?: string;
  kelas?: string;
  sekolah: string;
  bergabung: string;
}

export const akunProfil: Record<Role, AkunProfil> = {
  siswa: {
    nama: "Aisyah Putri",
    email: "aisyah.putri@contoh.sch.id",
    role: "siswa",
    jenjang: "SMP",
    kelas: "8B",
    sekolah: "SMP Negeri 1 Cerdas",
    bergabung: "Juli 2025",
  },
  guru: {
    nama: "Pak Bagus Santoso",
    email: "bagus.santoso@contoh.sch.id",
    role: "guru",
    sekolah: "SMP Negeri 1 Cerdas",
    bergabung: "Januari 2024",
  },
  admin: {
    nama: "Ibu Rina Wijaya",
    email: "rina.wijaya@contoh.sch.id",
    role: "admin",
    sekolah: "SMP Negeri 1 Cerdas",
    bergabung: "Agustus 2023",
  },
};

export const roleLabel: Record<Role, string> = {
  siswa: "Siswa",
  guru: "Guru",
  admin: "Admin Sekolah",
};

export type AkunSectionId =
  | "profil"
  | "keamanan"
  | "sesi"
  | "preferensi"
  | "privasi";

export interface AkunSection {
  id: AkunSectionId;
  label: string;
  deskripsi: string;
  icon: "user" | "shield" | "monitor" | "sliders" | "lock";
}

/** Navigasi bagian pada halaman Akun. Diisi bertahap oleh tiap bagian. */
export const akunSections: AkunSection[] = [
  { id: "profil", label: "Profil", deskripsi: "Data diri & sekolah", icon: "user" },
  { id: "keamanan", label: "Keamanan", deskripsi: "Kata sandi & akses", icon: "shield" },
  { id: "sesi", label: "Sesi & Perangkat", deskripsi: "Perangkat yang masuk", icon: "monitor" },
  { id: "preferensi", label: "Preferensi", deskripsi: "Notifikasi & tampilan", icon: "sliders" },
  { id: "privasi", label: "Privasi & Data", deskripsi: "Perlindungan data anak", icon: "lock" },
];
