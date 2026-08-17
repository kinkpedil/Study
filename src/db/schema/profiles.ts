import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

import { schools } from "./schools";
import { roleEnum, jenjangEnum } from "./enums";

/**
 * Profil pengguna. `id` sama dengan `auth.users.id` milik Supabase (relasi 1:1
 * yang diisi lewat trigger/insert saat pendaftaran), sehingga tabel lain cukup
 * mereferensikan `profiles.id`. Kolom auth (email, password) dikelola Supabase.
 */
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  schoolId: uuid("school_id").references(() => schools.id, {
    onDelete: "set null",
  }),
  fullName: text("full_name").notNull(),
  role: roleEnum("role").notNull().default("siswa"),
  // jenjang & kelas hanya wajib untuk siswa; guru/admin boleh null.
  jenjang: jenjangEnum("jenjang"),
  kelas: text("kelas"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
