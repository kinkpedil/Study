import "server-only";

import type { Profile } from "@/db/schema";
import { getRingkasanProgres, type RingkasanProgres } from "./progres";
import { listNotifikasi, type DaftarNotifikasi } from "./notifikasi";

/**
 * Data Beranda yang disaring per peran. Setiap peran hanya menerima bagian
 * yang relevan dan berwenang untuknya:
 * - siswa: ringkasan progres belajar pribadi
 * - guru: ringkasan mengajar (kelas/tugas) — sumbernya menyusul di backend Tugas
 * - admin: ringkasan sekolah (laporan/audit) — sumbernya menyusul di backend Forum
 *
 * Notifikasi tersedia untuk semua peran, tetap dibatasi ke milik pengguna.
 */

interface ProfilRingkas {
  id: string;
  nama: string;
  role: Profile["role"];
  jenjang: Profile["jenjang"];
  kelas: Profile["kelas"];
  schoolId: Profile["schoolId"];
}

interface BerandaBase {
  profil: ProfilRingkas;
  notifikasi: DaftarNotifikasi;
}

export interface BerandaSiswa extends BerandaBase {
  role: "siswa";
  progres: RingkasanProgres;
}

export interface BerandaGuru extends BerandaBase {
  role: "guru";
  mengajar: {
    // Diisi oleh backend Tugas (classes, assignments, submissions).
    kelasDiampu: number;
    tugasAktif: number;
    perluDinilai: number;
  };
}

export interface BerandaAdmin extends BerandaBase {
  role: "admin";
  sekolah: {
    // Diisi oleh backend Forum/Moderasi (reports, school_forums, audit_logs).
    laporanTerbuka: number;
    forumSekolah: number;
  };
}

export type BerandaData = BerandaSiswa | BerandaGuru | BerandaAdmin;

function ringkasProfil(p: Profile): ProfilRingkas {
  return {
    id: p.id,
    nama: p.fullName,
    role: p.role,
    jenjang: p.jenjang,
    kelas: p.kelas,
    schoolId: p.schoolId,
  };
}

/**
 * Menyusun data Beranda sesuai peran pengguna. Cabang peran memastikan data
 * satu peran tidak bocor ke peran lain (mis. siswa tidak menerima antrean
 * penilaian guru).
 */
export async function getBerandaData(profile: Profile): Promise<BerandaData> {
  const profil = ringkasProfil(profile);
  const notifikasi = await listNotifikasi(profile.id);
  const base: BerandaBase = { profil, notifikasi };

  switch (profile.role) {
    case "siswa": {
      const progres = await getRingkasanProgres(profile.id);
      return { ...base, role: "siswa", progres };
    }
    case "guru": {
      // TODO(tugas-backend): hitung dari classes/assignments/submissions guru.
      return {
        ...base,
        role: "guru",
        mengajar: { kelasDiampu: 0, tugasAktif: 0, perluDinilai: 0 },
      };
    }
    case "admin": {
      // TODO(forum-backend): hitung dari reports & school_forums sekolah admin.
      return {
        ...base,
        role: "admin",
        sekolah: { laporanTerbuka: 0, forumSekolah: 0 },
      };
    }
  }
}
