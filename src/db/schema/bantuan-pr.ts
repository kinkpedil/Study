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

import { profiles } from "./profiles";
import { jenjangEnum, hwSenderEnum, hwMsgTipeEnum, hwStatusEnum } from "./enums";

/**
 * Skema fitur Bantuan PR: sesi tanya-jawab dan pesan di dalamnya. RLS ketat —
 * pengguna hanya bisa mengakses sesinya sendiri (auth.uid() = profile_id);
 * pesan mengikuti kepemilikan sesi induk. Ditujukan ke role `authenticated`.
 */

/* --------------------------- homework_sessions --------------------------- */

export const homeworkSessions = pgTable(
  "homework_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    judul: text("judul").notNull(),
    mapel: text("mapel").notNull(),
    jenjang: jenjangEnum("jenjang"),
    pertanyaan: text("pertanyaan").notNull(),
    // URL lampiran foto soal di Supabase Storage (opsional).
    fotoUrl: text("foto_url"),
    status: hwStatusEnum("status").notNull().default("berlangsung"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("homework_sessions_profile_idx").on(t.profileId, t.createdAt),
    pgPolicy("homework_sessions_owner", {
      as: "permissive",
      for: "all",
      to: "authenticated",
      using: sql`${t.profileId} = (select auth.uid())`,
      withCheck: sql`${t.profileId} = (select auth.uid())`,
    }),
  ],
);

/* --------------------------- homework_messages --------------------------- */

export const homeworkMessages = pgTable(
  "homework_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => homeworkSessions.id, { onDelete: "cascade" }),
    sender: hwSenderEnum("sender").notNull(),
    tipe: hwMsgTipeEnum("tipe").notNull().default("pertanyaan"),
    content: text("content").notNull(),
    // Urutan tampil dalam sesi.
    urutan: integer("urutan").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("homework_messages_session_idx").on(t.sessionId, t.urutan),
    // Akses pesan mengikuti kepemilikan sesi induk.
    pgPolicy("homework_messages_owner", {
      as: "permissive",
      for: "all",
      to: "authenticated",
      using: sql`exists (select 1 from homework_sessions s where s.id = ${t.sessionId} and s.profile_id = (select auth.uid()))`,
      withCheck: sql`exists (select 1 from homework_sessions s where s.id = ${t.sessionId} and s.profile_id = (select auth.uid()))`,
    }),
  ],
);

export type HomeworkSession = typeof homeworkSessions.$inferSelect;
export type NewHomeworkSession = typeof homeworkSessions.$inferInsert;
export type HomeworkMessage = typeof homeworkMessages.$inferSelect;
export type NewHomeworkMessage = typeof homeworkMessages.$inferInsert;
