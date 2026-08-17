import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  index,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { jenjangEnum } from "./enums";

/**
 * Skema Perpustakaan Digital: kategori & buku. Katalog bersifat publik untuk
 * semua pengguna terautentikasi (RLS: select untuk `authenticated`); penulisan
 * dilakukan lewat service role (admin), bukan pengguna biasa.
 *
 * Buku hanya menyimpan metadata + tautan sumber resmi (Kemendikbud). Tidak ada
 * konten berhak cipta yang disalin.
 */

/* --------------------------- library_categories --------------------------- */

export const libraryCategories = pgTable(
  "library_categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull().unique(),
    slug: text("slug").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  () => [
    pgPolicy("library_categories_select", {
      as: "permissive",
      for: "select",
      to: "authenticated",
      using: sql`true`,
    }),
  ],
);

/* ----------------------------- library_books ----------------------------- */

export const libraryBooks = pgTable(
  "library_books",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    author: text("author").notNull(),
    publisher: text("publisher"),
    jenjang: jenjangEnum("jenjang").notNull(),
    kelas: text("kelas"),
    mapel: text("mapel").notNull(),
    categoryId: uuid("category_id").references(() => libraryCategories.id, {
      onDelete: "set null",
    }),
    tahun: integer("tahun"),
    deskripsi: text("deskripsi"),
    // Tautan ke sumber resmi; wajib agar selalu menampilkan asal.
    sumberUrl: text("sumber_url").notNull(),
    coverUrl: text("cover_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("library_books_jenjang_idx").on(t.jenjang),
    index("library_books_mapel_idx").on(t.mapel),
    index("library_books_category_idx").on(t.categoryId),
    pgPolicy("library_books_select", {
      as: "permissive",
      for: "select",
      to: "authenticated",
      using: sql`true`,
    }),
  ],
);

export type LibraryCategory = typeof libraryCategories.$inferSelect;
export type NewLibraryCategory = typeof libraryCategories.$inferInsert;
export type LibraryBook = typeof libraryBooks.$inferSelect;
export type NewLibraryBook = typeof libraryBooks.$inferInsert;
