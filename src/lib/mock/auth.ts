/**
 * Akun demo untuk halaman masuk (data tiruan). Autentikasi asli memakai
 * Supabase Auth pada layer backend; ini hanya untuk pratinjau alur & peran.
 */

import type { Role } from "./roles";

export interface AkunDemo {
  role: Role;
  label: string;
  email: string;
  nama: string;
}

export const akunDemo: AkunDemo[] = [
  {
    role: "siswa",
    label: "Siswa",
    email: "aisyah.putri@contoh.sch.id",
    nama: "Aisyah Putri",
  },
  {
    role: "guru",
    label: "Guru",
    email: "bagus.santoso@contoh.sch.id",
    nama: "Pak Bagus Santoso",
  },
  {
    role: "admin",
    label: "Admin Sekolah",
    email: "rina.wijaya@contoh.sch.id",
    nama: "Ibu Rina Wijaya",
  },
];
