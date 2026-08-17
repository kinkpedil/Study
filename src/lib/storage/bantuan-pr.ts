/**
 * Penyimpanan lokal (localStorage) untuk Bantuan PR: daftar sesi buatan
 * pengguna dan progres tiap percakapan. Sementara sampai backend tersedia;
 * setelah itu digantikan homework_sessions/homework_messages.
 *
 * Semua fungsi aman dipanggil di server (mengembalikan default bila `window`
 * tidak ada).
 */

import type { Jenjang } from "@/lib/mock/beranda";

const SESSIONS_KEY = "sekolah-cerdas:bantuan-pr:sessions";
const progressKey = (id: string) =>
  `sekolah-cerdas:bantuan-pr:progress:${id}`;

export interface LocalSession {
  id: string;
  judul: string;
  mapel: string;
  jenjang: Jenjang;
  pertanyaan: string;
  cuplikan: string;
  tanggal: string; // ISO
  jumlahPetunjuk: number;
  selesai: boolean;
}

export interface FollowUp {
  id: number;
  tanya: string;
}

export interface ConvProgress {
  terungkap: number;
  tampilFinal: boolean;
  jawabanState: "idle" | "konfirmasi" | "tampil";
  jenjang: Jenjang;
  tindakLanjut: FollowUp[];
}

function hasWindow() {
  return typeof window !== "undefined";
}

export function loadLocalSessions(): LocalSession[] {
  if (!hasWindow()) return [];
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? (JSON.parse(raw) as LocalSession[]) : [];
  } catch {
    return [];
  }
}

export function saveLocalSession(session: LocalSession) {
  if (!hasWindow()) return;
  try {
    const list = loadLocalSessions().filter((s) => s.id !== session.id);
    list.unshift(session);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(list));
  } catch {
    /* penyimpanan penuh / tidak tersedia */
  }
}

export function loadLocalSession(id: string): LocalSession | null {
  return loadLocalSessions().find((s) => s.id === id) ?? null;
}

export function loadProgress(id: string): ConvProgress | null {
  if (!hasWindow()) return null;
  try {
    const raw = localStorage.getItem(progressKey(id));
    return raw ? (JSON.parse(raw) as ConvProgress) : null;
  } catch {
    return null;
  }
}

export function saveProgress(id: string, progress: ConvProgress) {
  if (!hasWindow()) return;
  try {
    localStorage.setItem(progressKey(id), JSON.stringify(progress));
  } catch {
    /* abaikan */
  }
}

/** Membuat id sesi lokal yang unik. */
export function newSessionId() {
  return `lokal_${Date.now().toString(36)}`;
}
