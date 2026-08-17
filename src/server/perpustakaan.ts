import "server-only";

import { and, or, eq, ilike, desc, sql, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { libraryBooks, libraryCategories, savedBooks } from "@/db/schema";

export interface FilterBuku {
  q?: string;
  jenjang?: "SD" | "SMP" | "SMA";
  mapel?: string;
  kategoriSlug?: string;
  limit?: number;
  offset?: number;
}

export interface BukuRingkas {
  id: string;
  title: string;
  author: string;
  jenjang: string;
  kelas: string | null;
  mapel: string;
  kategori: string | null;
  tahun: number | null;
  coverUrl: string | null;
}

export interface HasilCariBuku {
  items: BukuRingkas[];
  total: number;
  limit: number;
  offset: number;
}

/** Escape wildcard ILIKE agar input diperlakukan literal. */
function escapeLike(s: string): string {
  return s.replace(/[\\%_]/g, (m) => `\\${m}`);
}

/**
 * Pencarian & filter buku katalog. Pencarian `q` mencocokkan judul/penulis/
 * penerbit/mapel; filter jenjang, mapel, dan kategori (slug) dapat digabung.
 */
export async function cariBuku(filter: FilterBuku): Promise<HasilCariBuku> {
  const limit = Math.min(Math.max(filter.limit ?? 20, 1), 50);
  const offset = Math.max(filter.offset ?? 0, 0);

  const conds: SQL[] = [];
  if (filter.q && filter.q.trim()) {
    const like = `%${escapeLike(filter.q.trim())}%`;
    const cond = or(
      ilike(libraryBooks.title, like),
      ilike(libraryBooks.author, like),
      ilike(libraryBooks.publisher, like),
      ilike(libraryBooks.mapel, like),
    );
    if (cond) conds.push(cond);
  }
  if (filter.jenjang) conds.push(eq(libraryBooks.jenjang, filter.jenjang));
  if (filter.mapel) conds.push(eq(libraryBooks.mapel, filter.mapel));
  if (filter.kategoriSlug)
    conds.push(eq(libraryCategories.slug, filter.kategoriSlug));

  const where = conds.length ? and(...conds) : undefined;

  const [items, totalRows] = await Promise.all([
    db
      .select({
        id: libraryBooks.id,
        title: libraryBooks.title,
        author: libraryBooks.author,
        jenjang: libraryBooks.jenjang,
        kelas: libraryBooks.kelas,
        mapel: libraryBooks.mapel,
        kategori: libraryCategories.name,
        tahun: libraryBooks.tahun,
        coverUrl: libraryBooks.coverUrl,
      })
      .from(libraryBooks)
      .leftJoin(
        libraryCategories,
        eq(libraryBooks.categoryId, libraryCategories.id),
      )
      .where(where)
      .orderBy(desc(libraryBooks.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(libraryBooks)
      .leftJoin(
        libraryCategories,
        eq(libraryBooks.categoryId, libraryCategories.id),
      )
      .where(where),
  ]);

  return { items, total: totalRows[0]?.count ?? 0, limit, offset };
}

export interface BukuDetail {
  id: string;
  title: string;
  author: string;
  publisher: string | null;
  jenjang: string;
  kelas: string | null;
  mapel: string;
  kategori: string | null;
  tahun: number | null;
  deskripsi: string | null;
  sumberUrl: string;
  coverUrl: string | null;
  tersimpan: boolean;
}

/**
 * Detail satu buku + nama kategori, disertai status tersimpan untuk pengguna.
 * Mengembalikan null bila buku tidak ada.
 */
export async function getDetailBuku(
  id: string,
  profileId: string,
): Promise<BukuDetail | null> {
  const [buku] = await db
    .select({
      id: libraryBooks.id,
      title: libraryBooks.title,
      author: libraryBooks.author,
      publisher: libraryBooks.publisher,
      jenjang: libraryBooks.jenjang,
      kelas: libraryBooks.kelas,
      mapel: libraryBooks.mapel,
      kategori: libraryCategories.name,
      tahun: libraryBooks.tahun,
      deskripsi: libraryBooks.deskripsi,
      sumberUrl: libraryBooks.sumberUrl,
      coverUrl: libraryBooks.coverUrl,
    })
    .from(libraryBooks)
    .leftJoin(
      libraryCategories,
      eq(libraryBooks.categoryId, libraryCategories.id),
    )
    .where(eq(libraryBooks.id, id))
    .limit(1);

  if (!buku) return null;

  const saved = await db
    .select({ id: savedBooks.id })
    .from(savedBooks)
    .where(and(eq(savedBooks.profileId, profileId), eq(savedBooks.bookId, id)))
    .limit(1);

  return { ...buku, tersimpan: saved.length > 0 };
}
