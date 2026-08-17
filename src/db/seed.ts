/**
 * Seed data Perpustakaan: kategori + buku dari sumber resmi (metadata & tautan
 * Kemendikbud, tanpa menyalin konten). Jalankan dengan `npm run db:seed`
 * (butuh DATABASE_URL). Idempoten: kategori berdasarkan slug, buku berdasarkan
 * judul.
 *
 * Standalone (tidak memakai klien `@/db` yang server-only) agar bisa jalan di
 * Node biasa.
 */
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";

import * as schema from "./schema";
import { libraryCategories, libraryBooks } from "./schema";
import { daftarBuku, kategoriList } from "../lib/mock/perpustakaan";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL belum diset. Lihat .env.example.");
  }
  const client = postgres(url, { prepare: false });
  const db = drizzle(client, { schema, casing: "snake_case" });

  console.log("Seeding kategori…");
  for (const nama of kategoriList) {
    await db
      .insert(libraryCategories)
      .values({ name: nama, slug: slugify(nama) })
      .onConflictDoNothing({ target: libraryCategories.slug });
  }

  const kategoriRows = await db
    .select({ id: libraryCategories.id, name: libraryCategories.name })
    .from(libraryCategories);
  const kategoriId = new Map(kategoriRows.map((k) => [k.name, k.id]));

  console.log("Seeding buku…");
  let ditambah = 0;
  for (const b of daftarBuku) {
    const sudahAda = await db
      .select({ id: libraryBooks.id })
      .from(libraryBooks)
      .where(eq(libraryBooks.title, b.judul))
      .limit(1);
    if (sudahAda.length > 0) continue;

    await db.insert(libraryBooks).values({
      title: b.judul,
      author: b.penulis,
      publisher: b.penerbit,
      jenjang: b.jenjang,
      kelas: b.kelas,
      mapel: b.mapel,
      categoryId: kategoriId.get(b.kategori) ?? null,
      tahun: b.tahun,
      deskripsi: b.deskripsi,
      sumberUrl: b.sumberUrl,
    });
    ditambah += 1;
  }

  console.log(
    `Selesai: ${kategoriList.length} kategori dipastikan ada, ${ditambah} buku baru ditambahkan.`,
  );
  await client.end();
}

main().catch((err) => {
  console.error("Seed gagal:", err);
  process.exit(1);
});
