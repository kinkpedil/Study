import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
  index,
  unique,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { profiles } from "./profiles";
import { jenjangEnum, kesulitanEnum, soalTipeEnum } from "./enums";

/**
 * Skema fitur Generator Latihan Soal: paket soal, soal, pengerjaan, dan
 * jawaban. RLS ketat: pengguna hanya bisa mengakses miliknya sendiri; paket
 * publik boleh dibaca semua pengguna terautentikasi.
 *
 * Catatan: `(select auth.uid())` adalah id pengguna Supabase, sama dengan
 * `profiles.id`. Semua policy ditujukan ke role `authenticated`.
 */

/* --------------------------- exercise_sets --------------------------- */

export const exerciseSets = pgTable(
  "exercise_sets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    authorProfileId: uuid("author_profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    judul: text("judul").notNull(),
    jenjang: jenjangEnum("jenjang").notNull(),
    kelas: text("kelas").notNull(),
    mapel: text("mapel").notNull(),
    topik: text("topik"),
    kesulitan: kesulitanEnum("kesulitan").notNull().default("sedang"),
    jumlahSoal: integer("jumlah_soal").notNull().default(0),
    isPublic: boolean("is_public").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("exercise_sets_author_idx").on(t.authorProfileId),
    // Baca: pemilik atau paket publik.
    pgPolicy("exercise_sets_select", {
      as: "permissive",
      for: "select",
      to: "authenticated",
      using: sql`${t.authorProfileId} = (select auth.uid()) or ${t.isPublic}`,
    }),
    // Tulis/ubah/hapus: hanya pemilik.
    pgPolicy("exercise_sets_insert", {
      as: "permissive",
      for: "insert",
      to: "authenticated",
      withCheck: sql`${t.authorProfileId} = (select auth.uid())`,
    }),
    pgPolicy("exercise_sets_update", {
      as: "permissive",
      for: "update",
      to: "authenticated",
      using: sql`${t.authorProfileId} = (select auth.uid())`,
      withCheck: sql`${t.authorProfileId} = (select auth.uid())`,
    }),
    pgPolicy("exercise_sets_delete", {
      as: "permissive",
      for: "delete",
      to: "authenticated",
      using: sql`${t.authorProfileId} = (select auth.uid())`,
    }),
  ],
);

/* ------------------------------ questions ------------------------------ */

export const questions = pgTable(
  "questions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    exerciseSetId: uuid("exercise_set_id")
      .notNull()
      .references(() => exerciseSets.id, { onDelete: "cascade" }),
    nomor: integer("nomor").notNull(),
    tipe: soalTipeEnum("tipe").notNull().default("pilihan_ganda"),
    pertanyaan: text("pertanyaan").notNull(),
    // opsi: array {id,teks} untuk pilihan ganda; null untuk esai.
    opsi: jsonb("opsi").$type<{ id: string; teks: string }[]>(),
    kunci: text("kunci").notNull(),
    pembahasan: text("pembahasan"),
  },
  (t) => [
    unique("questions_set_nomor_uq").on(t.exerciseSetId, t.nomor),
    // Akses soal mengikuti hak akses paket induknya.
    pgPolicy("questions_select", {
      as: "permissive",
      for: "select",
      to: "authenticated",
      using: sql`exists (select 1 from exercise_sets es where es.id = ${t.exerciseSetId} and (es.author_profile_id = (select auth.uid()) or es.is_public))`,
    }),
    pgPolicy("questions_write", {
      as: "permissive",
      for: "all",
      to: "authenticated",
      using: sql`exists (select 1 from exercise_sets es where es.id = ${t.exerciseSetId} and es.author_profile_id = (select auth.uid()))`,
      withCheck: sql`exists (select 1 from exercise_sets es where es.id = ${t.exerciseSetId} and es.author_profile_id = (select auth.uid()))`,
    }),
  ],
);

/* ------------------------------ attempts ------------------------------ */

export const attempts = pgTable(
  "attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    exerciseSetId: uuid("exercise_set_id")
      .notNull()
      .references(() => exerciseSets.id, { onDelete: "cascade" }),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    // score 0–100 (porsi pilihan ganda); null bila belum selesai.
    score: integer("score"),
    benar: integer("benar"),
    total: integer("total"),
    startedAt: timestamp("started_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
  },
  (t) => [
    index("attempts_profile_idx").on(t.profileId, t.startedAt),
    // Hanya pemilik pengerjaan yang boleh mengakses.
    pgPolicy("attempts_owner", {
      as: "permissive",
      for: "all",
      to: "authenticated",
      using: sql`${t.profileId} = (select auth.uid())`,
      withCheck: sql`${t.profileId} = (select auth.uid())`,
    }),
  ],
);

/* ------------------------------- answers ------------------------------- */

export const answers = pgTable(
  "answers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    attemptId: uuid("attempt_id")
      .notNull()
      .references(() => attempts.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    jawaban: text("jawaban"),
    benar: boolean("benar"),
  },
  (t) => [
    unique("answers_attempt_question_uq").on(t.attemptId, t.questionId),
    // Jawaban mengikuti kepemilikan attempt.
    pgPolicy("answers_owner", {
      as: "permissive",
      for: "all",
      to: "authenticated",
      using: sql`exists (select 1 from attempts a where a.id = ${t.attemptId} and a.profile_id = (select auth.uid()))`,
      withCheck: sql`exists (select 1 from attempts a where a.id = ${t.attemptId} and a.profile_id = (select auth.uid()))`,
    }),
  ],
);

export type ExerciseSet = typeof exerciseSets.$inferSelect;
export type NewExerciseSet = typeof exerciseSets.$inferInsert;
export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
export type Attempt = typeof attempts.$inferSelect;
export type NewAttempt = typeof attempts.$inferInsert;
export type Answer = typeof answers.$inferSelect;
export type NewAnswer = typeof answers.$inferInsert;
