import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  index,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { profiles } from "./profiles";
import { schools } from "./schools";
import {
  jenjangEnum,
  tutorStatusEnum,
  tutorSenderEnum,
  tutorRiskEnum,
  tutorEskalasiStatusEnum,
} from "./enums";

/**
 * Skema fitur Tutor AI Pribadi.
 *
 * - `tutor_sessions` & `tutor_messages`: percakapan belajar milik siswa. RLS
 *   ketat — hanya pemilik (auth.uid() = profile_id) yang bisa mengakses; pesan
 *   mengikuti kepemilikan sesi induk.
 * - `tutor_escalations`: sesi yang diteruskan siswa ke guru. Siswa hanya bisa
 *   mengakses eskalasinya sendiri; guru/admin bisa membaca & memperbarui
 *   eskalasi dari sekolahnya (school-scoped), tanpa membuka seluruh transkrip.
 *
 * Semua kebijakan ditujukan ke role `authenticated`.
 */

/* ----------------------------- tutor_sessions ---------------------------- */

export const tutorSessions = pgTable(
  "tutor_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    judul: text("judul").notNull(),
    mapel: text("mapel").notNull(),
    jenjang: jenjangEnum("jenjang"),
    status: tutorStatusEnum("status").notNull().default("berlangsung"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("tutor_sessions_profile_idx").on(t.profileId, t.createdAt),
    pgPolicy("tutor_sessions_owner", {
      as: "permissive",
      for: "all",
      to: "authenticated",
      using: sql`${t.profileId} = (select auth.uid())`,
      withCheck: sql`${t.profileId} = (select auth.uid())`,
    }),
  ],
);

/* ----------------------------- tutor_messages ---------------------------- */

export const tutorMessages = pgTable(
  "tutor_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => tutorSessions.id, { onDelete: "cascade" }),
    sender: tutorSenderEnum("sender").notNull(),
    content: text("content").notNull(),
    // Urutan tampil dalam sesi.
    urutan: integer("urutan").notNull().default(0),
    // Ditandai moderasi AI bila menyentuh topik berisiko.
    flagged: boolean("flagged").notNull().default(false),
    riskKategori: tutorRiskEnum("risk_kategori"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("tutor_messages_session_idx").on(t.sessionId, t.urutan),
    // Akses pesan mengikuti kepemilikan sesi induk.
    pgPolicy("tutor_messages_owner", {
      as: "permissive",
      for: "all",
      to: "authenticated",
      using: sql`exists (select 1 from tutor_sessions s where s.id = ${t.sessionId} and s.profile_id = (select auth.uid()))`,
      withCheck: sql`exists (select 1 from tutor_sessions s where s.id = ${t.sessionId} and s.profile_id = (select auth.uid()))`,
    }),
  ],
);

/* --------------------------- tutor_escalations --------------------------- */

export const tutorEscalations = pgTable(
  "tutor_escalations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => tutorSessions.id, { onDelete: "cascade" }),
    siswaId: uuid("siswa_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    // Sekolah siswa, didenormalisasi agar guru bisa di-scope tanpa join berat.
    schoolId: uuid("school_id").references(() => schools.id, {
      onDelete: "set null",
    }),
    // Guru tujuan bila siswa memilih; null = terbuka untuk guru sekolah.
    guruId: uuid("guru_id").references(() => profiles.id, {
      onDelete: "set null",
    }),
    judul: text("judul").notNull(),
    mapel: text("mapel").notNull(),
    jenjang: jenjangEnum("jenjang"),
    catatan: text("catatan"),
    status: tutorEskalasiStatusEnum("status").notNull().default("baru"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("tutor_escalations_school_idx").on(t.schoolId, t.status, t.createdAt),
    index("tutor_escalations_siswa_idx").on(t.siswaId, t.createdAt),
    // Siswa: akses penuh atas eskalasi miliknya sendiri.
    pgPolicy("tutor_escalations_siswa_owner", {
      as: "permissive",
      for: "all",
      to: "authenticated",
      using: sql`${t.siswaId} = (select auth.uid())`,
      withCheck: sql`${t.siswaId} = (select auth.uid())`,
    }),
    // Guru/admin: baca eskalasi dari sekolahnya.
    pgPolicy("tutor_escalations_guru_read", {
      as: "permissive",
      for: "select",
      to: "authenticated",
      using: sql`exists (select 1 from profiles p where p.id = (select auth.uid()) and p.role in ('guru','admin') and p.school_id = ${t.schoolId})`,
    }),
    // Guru/admin: perbarui status penanganan eskalasi sekolahnya.
    pgPolicy("tutor_escalations_guru_update", {
      as: "permissive",
      for: "update",
      to: "authenticated",
      using: sql`exists (select 1 from profiles p where p.id = (select auth.uid()) and p.role in ('guru','admin') and p.school_id = ${t.schoolId})`,
      withCheck: sql`exists (select 1 from profiles p where p.id = (select auth.uid()) and p.role in ('guru','admin') and p.school_id = ${t.schoolId})`,
    }),
  ],
);

export type TutorSession = typeof tutorSessions.$inferSelect;
export type NewTutorSession = typeof tutorSessions.$inferInsert;
export type TutorMessageRow = typeof tutorMessages.$inferSelect;
export type NewTutorMessage = typeof tutorMessages.$inferInsert;
export type TutorEscalation = typeof tutorEscalations.$inferSelect;
export type NewTutorEscalation = typeof tutorEscalations.$inferInsert;
