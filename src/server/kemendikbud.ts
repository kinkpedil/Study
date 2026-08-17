import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { libraryBooks, type NewLibraryBook } from "@/db/schema";
import type { Jenjang } from "@/lib/mock/beranda";

/**
 * Integrasi data buku dari sumber resmi Kemendikbud
 * (https://buku.kemendikdasmen.go.id/).
 *
 * Kepatuhan (sesuai PRD):
 *  - Hanya mengambil METADATA (judul, penulis, penerbit, jenjang, mapel, tahun)
 *    dan menautkan ke sumber asli. TIDAK menyalin konten berhak cipta.
 *  - Menghormati robots.txt sebelum mengakses halaman.
 *  - Mengirim User-Agent yang jelas dan memberi jeda antar-permintaan.
 *
 * Bila API resmi tersedia, endpoint-nya diisi di `fetchMetadata`. Sampai
 * kontraknya dipastikan, service tetap aman: gagal → daftar kosong, bukan error
 * fatal.
 */

const BASE =
  process.env.KEMENDIKBUD_BASE_URL ?? "https://buku.kemendikdasmen.go.id";
const USER_AGENT =
  process.env.KEMENDIKBUD_USER_AGENT ??
  "SekolahCerdasBot/0.1 (+https://sekolahcerdas.example)";
const REQUEST_DELAY_MS = 1500;

export interface BukuEksternal {
  judul: string;
  penulis: string;
  penerbit?: string;
  jenjang: Jenjang;
  kelas?: string;
  mapel: string;
  tahun?: number;
  deskripsi?: string;
  /** Tautan ke halaman sumber asli. */
  sumberUrl: string;
  coverUrl?: string;
}

export interface SyncOptions {
  jenjang?: Jenjang;
  mapel?: string;
  maxHalaman?: number;
}

export interface SyncResult {
  fetched: number;
  inserted: number;
  skipped: number;
  robotsBlocked: boolean;
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Mengecek robots.txt situs untuk path tertentu (parser minimal untuk grup
 * `User-agent: *`). 404 → izinkan; gagal jaringan → tolak (konservatif).
 */
export async function robotsMengizinkan(pathname: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/robots.txt`, {
      headers: { "User-Agent": USER_AGENT },
    });
    if (res.status === 404) return true;
    if (!res.ok) return false;

    const teks = await res.text();
    const disallow: string[] = [];
    let dalamGrupUmum = false;
    for (const barisRaw of teks.split("\n")) {
      const baris = barisRaw.trim();
      if (!baris || baris.startsWith("#")) continue;
      const [field, ...rest] = baris.split(":");
      const nilai = rest.join(":").trim();
      const key = field.trim().toLowerCase();
      if (key === "user-agent") {
        dalamGrupUmum = nilai === "*";
      } else if (key === "disallow" && dalamGrupUmum && nilai) {
        disallow.push(nilai);
      }
    }
    return !disallow.some((p) => pathname.startsWith(p));
  } catch {
    return false;
  }
}

/**
 * Mengambil metadata buku dari sumber. TODO: sesuaikan endpoint & parsing bila
 * API resmi Kemendikbud tersedia. Saat ini mengembalikan [] secara aman bila
 * respons tidak sesuai.
 */
async function fetchMetadata(
  opts: SyncOptions,
  halaman: number,
): Promise<BukuEksternal[]> {
  const url = new URL(`${BASE}/api/buku`);
  if (opts.jenjang) url.searchParams.set("jenjang", opts.jenjang);
  if (opts.mapel) url.searchParams.set("mapel", opts.mapel);
  url.searchParams.set("page", String(halaman));

  try {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) return [];
    const data = (await res.json()) as { items?: unknown[] };
    if (!Array.isArray(data.items)) return [];
    return data.items
      .map(normalize)
      .filter((b): b is BukuEksternal => b !== null);
  } catch {
    return [];
  }
}

/** Memetakan record mentah ke metadata aman (mengabaikan field isi/berkas). */
function normalize(raw: unknown): BukuEksternal | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const judul = typeof r.title === "string" ? r.title : undefined;
  const jenjang = r.jenjang as Jenjang | undefined;
  const mapel = typeof r.mapel === "string" ? r.mapel : undefined;
  if (!judul || !jenjang || !mapel) return null;

  const id = typeof r.id === "string" ? r.id : "";
  return {
    judul,
    penulis: typeof r.author === "string" ? r.author : "Kemendikbudristek",
    penerbit: typeof r.publisher === "string" ? r.publisher : undefined,
    jenjang,
    kelas: typeof r.kelas === "string" ? r.kelas : undefined,
    mapel,
    tahun: typeof r.year === "number" ? r.year : undefined,
    deskripsi: typeof r.description === "string" ? r.description : undefined,
    sumberUrl: typeof r.url === "string" ? r.url : `${BASE}/buku/${id}`,
    coverUrl: typeof r.cover === "string" ? r.cover : undefined,
  };
}

/**
 * Menyinkronkan metadata buku ke tabel library_books. Idempoten: melewati buku
 * yang judulnya sudah ada. Menghormati robots.txt dan memberi jeda antar-halaman.
 */
export async function syncKemendikbudBooks(
  opts: SyncOptions = {},
): Promise<SyncResult> {
  const hasil: SyncResult = {
    fetched: 0,
    inserted: 0,
    skipped: 0,
    robotsBlocked: false,
  };

  if (!(await robotsMengizinkan("/api/buku"))) {
    hasil.robotsBlocked = true;
    return hasil;
  }

  const maxHalaman = Math.min(Math.max(opts.maxHalaman ?? 1, 1), 20);
  for (let halaman = 1; halaman <= maxHalaman; halaman++) {
    const batch = await fetchMetadata(opts, halaman);
    if (batch.length === 0) break;
    hasil.fetched += batch.length;

    for (const b of batch) {
      const ada = await db
        .select({ id: libraryBooks.id })
        .from(libraryBooks)
        .where(eq(libraryBooks.title, b.judul))
        .limit(1);
      if (ada.length > 0) {
        hasil.skipped += 1;
        continue;
      }
      const nilai: NewLibraryBook = {
        title: b.judul,
        author: b.penulis,
        publisher: b.penerbit,
        jenjang: b.jenjang,
        kelas: b.kelas,
        mapel: b.mapel,
        tahun: b.tahun,
        deskripsi: b.deskripsi,
        sumberUrl: b.sumberUrl,
        coverUrl: b.coverUrl,
      };
      await db.insert(libraryBooks).values(nilai);
      hasil.inserted += 1;
    }

    if (halaman < maxHalaman) await delay(REQUEST_DELAY_MS);
  }

  return hasil;
}
