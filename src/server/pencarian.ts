import "server-only";

import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Pencarian global lintas konten & diskusi.
 *
 * Sumber konten (buku perpustakaan, forum/diskusi, paket soal) berada di tabel
 * yang dibuat pada task backend halaman masing-masing (Perpustakaan, Forum,
 * Generator Latihan Soal). Agar Beranda bisa memakai API ini lebih dulu,
 * pencarian dirancang modular: tiap tipe punya adapter sendiri. Adapter yang
 * tabelnya belum tersedia mengembalikan [] dan diisi saat task terkait jalan.
 */

export type SearchType = "materi" | "soal" | "buku" | "diskusi";

export interface SearchResult {
  id: string;
  type: SearchType;
  title: string;
  subtitle: string;
  href: string;
}

export interface SearchResponse {
  query: string;
  total: number;
  results: SearchResult[];
}

const MIN_QUERY = 2;
const MAX_QUERY = 100;
const DEFAULT_LIMIT = 8;

/** Konteks pencarian: dipakai untuk pembatasan jenjang siswa pada diskusi. */
export interface SearchContext {
  profileId: string;
}

/**
 * Menjalankan pencarian pada semua adapter dan menggabungkan hasilnya.
 * Query dinormalisasi & dibatasi panjangnya sebelum dipakai.
 */
export async function searchGlobal(
  rawQuery: string,
  ctx: SearchContext,
  limit = DEFAULT_LIMIT,
): Promise<SearchResponse> {
  const query = rawQuery.trim().slice(0, MAX_QUERY);
  if (query.length < MIN_QUERY) {
    return { query, total: 0, results: [] };
  }

  // Ambil jenjang siswa untuk membatasi hasil diskusi sesuai kebijakan anak.
  const jenjang = await getJenjang(ctx.profileId);

  const perType = Math.max(2, Math.ceil(limit / 2));
  const groups = await Promise.all([
    searchMateri(query, perType),
    searchSoal(query, ctx.profileId, perType),
    searchBuku(query, perType),
    searchDiskusi(query, jenjang, perType),
  ]);

  const results = groups.flat().slice(0, limit);
  return { query, total: results.length, results };
}

async function getJenjang(profileId: string): Promise<string | null> {
  const rows = await db
    .select({ jenjang: profiles.jenjang })
    .from(profiles)
    .where(eq(profiles.id, profileId))
    .limit(1);
  return rows[0]?.jenjang ?? null;
}

/** Escape karakter wildcard ILIKE agar input pengguna diperlakukan literal. */
export function escapeLike(input: string): string {
  return input.replace(/[\\%_]/g, (m) => `\\${m}`);
}

/* -------------------------------------------------------------------------
 * Adapter per tipe. Tabel sumber dibuat di task backend halaman terkait;
 * sampai tersedia, adapter mengembalikan daftar kosong.
 * ------------------------------------------------------------------------- */

// TODO(perpustakaan-backend): kueri tabel `library_books`
// WHERE title/author ILIKE %query% (escapeLike) LIMIT limit.
async function searchBuku(_query: string, _limit: number): Promise<SearchResult[]> {
  return [];
}

// TODO(forum-backend): kueri `forum_threads` (dan/atau `forum_posts`)
// dibatasi audience_jenjang = jenjang siswa, ILIKE pada title/body.
async function searchDiskusi(
  _query: string,
  _jenjang: string | null,
  _limit: number,
): Promise<SearchResult[]> {
  return [];
}

// TODO(generator-backend): kueri `exercise_sets`/`questions` milik pengguna
// atau publik, ILIKE pada judul/topik.
async function searchSoal(
  _query: string,
  _profileId: string,
  _limit: number,
): Promise<SearchResult[]> {
  return [];
}

// TODO(materi-backend): kueri tabel materi bila tersedia.
async function searchMateri(
  _query: string,
  _limit: number,
): Promise<SearchResult[]> {
  return [];
}
