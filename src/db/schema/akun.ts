import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  index,
  unique,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { profiles } from "./profiles";
import { schools } from "./schools";
import { auditKategoriEnum, consentStatusEnum } from "./enums";

/**
 * Skema Akun & Keamanan:
 * - `audit_logs`: catatan aktivitas penting (tak-berubah) untuk akuntabilitas;
 *   dibaca admin sekolahnya. Nama aktor disimpan sebagai snapshot agar tetap
 *   terbaca meski profil aktor dihapus.
 * - `parental_consents`: persetujuan orang tua/wali untuk akun anak.
 * - `data_permissions`: izin pemrosesan data per pengguna.
 *
 * RLS ketat: consent & izin owner-only; audit log dibaca admin sekolah, ditulis
 * server (tanpa update/delete) agar tak dapat diubah. Data anak dilindungi.
 */

/* ------------------------------- audit_logs ------------------------------ */

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    schoolId: uuid("school_id").references(() => schools.id, {
      onDelete: "set null",
    }),
    // Aktor null = tindakan sistem. Nama disnapshot agar log tetap utuh.
    actorId: uuid("actor_id").references(() => profiles.id, {
      onDelete: "set null",
    }),
    actorNama: text("actor_nama").notNull(),
    kategori: auditKategoriEnum("kategori").notNull(),
    aksi: text("aksi").notNull(),
    target: text("target"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("audit_logs_school_idx").on(t.schoolId, t.createdAt),
    index("audit_logs_kategori_idx").on(t.kategori),
    // Admin/guru sekolah dapat membaca log sekolahnya. Penulisan lewat server.
    pgPolicy("audit_logs_admin_read", {
      as: "permissive",
      for: "select",
      to: "authenticated",
      using: sql`exists (select 1 from profiles p where p.id = (select auth.uid()) and p.role = 'admin' and p.school_id = ${t.schoolId})`,
    }),
  ],
);

/* --------------------------- parental_consents --------------------------- */

export const parentalConsents = pgTable(
  "parental_consents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    waliNama: text("wali_nama").notNull(),
    waliEmail: text("wali_email").notNull(),
    status: consentStatusEnum("status").notNull().default("belum"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    unique("parental_consents_profile_uq").on(t.profileId),
    // Owner (siswa) mengakses persetujuannya sendiri.
    pgPolicy("parental_consents_owner", {
      as: "permissive",
      for: "all",
      to: "authenticated",
      using: sql`${t.profileId} = (select auth.uid())`,
      withCheck: sql`${t.profileId} = (select auth.uid())`,
    }),
  ],
);

/* --------------------------- data_permissions ---------------------------- */

export const dataPermissions = pgTable(
  "data_permissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    // Kunci izin, mis. "belajar", "ai", "rekomendasi".
    izinKey: text("izin_key").notNull(),
    aktif: boolean("aktif").notNull().default(false),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    unique("data_permissions_profile_key_uq").on(t.profileId, t.izinKey),
    pgPolicy("data_permissions_owner", {
      as: "permissive",
      for: "all",
      to: "authenticated",
      using: sql`${t.profileId} = (select auth.uid())`,
      withCheck: sql`${t.profileId} = (select auth.uid())`,
    }),
  ],
);

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
export type ParentalConsent = typeof parentalConsents.$inferSelect;
export type NewParentalConsent = typeof parentalConsents.$inferInsert;
export type DataPermission = typeof dataPermissions.$inferSelect;
export type NewDataPermission = typeof dataPermissions.$inferInsert;
