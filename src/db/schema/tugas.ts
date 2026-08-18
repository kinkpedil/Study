import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  index,
  unique,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { schools } from "./schools";
import { profiles } from "./profiles";
import { tugasTipeEnum, submissionStatusEnum } from "./enums";

/**
 * Skema Tugas & Penilaian: kelas, keanggotaan kelas, tugas, dan pengumpulan
 * (beserta nilai & umpan balik). RLS:
 *  - Kelas & tugas: guru pemilik kelas dan anggota kelas bisa membaca; guru
 *    menulis.
 *  - Pengumpulan: siswa mengakses miliknya; guru kelas mengakses semua untuk
 *    menilai.
 */

/* Predikat: user login adalah guru pemilik kelas `classIdExpr`. */
const guruKelas = (classIdExpr: unknown) => sql`exists (
  select 1 from classes c
  where c.id = ${classIdExpr} and c.teacher_profile_id = (select auth.uid())
)`;

/* Predikat: user login adalah anggota (siswa) kelas `classIdExpr`. */
const anggotaKelas = (classIdExpr: unknown) => sql`exists (
  select 1 from class_members cm
  where cm.class_id = ${classIdExpr} and cm.student_profile_id = (select auth.uid())
)`;

/* Predikat: user adalah guru kelas dari tugas `assignmentIdExpr`. */
const guruDariTugas = (assignmentIdExpr: unknown) => sql`exists (
  select 1 from assignments a join classes c on c.id = a.class_id
  where a.id = ${assignmentIdExpr} and c.teacher_profile_id = (select auth.uid())
)`;

/* Predikat: user adalah anggota kelas dari tugas `assignmentIdExpr`. */
const anggotaDariTugas = (assignmentIdExpr: unknown) => sql`exists (
  select 1 from assignments a join class_members cm on cm.class_id = a.class_id
  where a.id = ${assignmentIdExpr} and cm.student_profile_id = (select auth.uid())
)`;

/* --------------------------------- classes --------------------------------- */

export const classes = pgTable(
  "classes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    teacherProfileId: uuid("teacher_profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    schoolId: uuid("school_id")
      .notNull()
      .references(() => schools.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    mapel: text("mapel").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("classes_teacher_idx").on(t.teacherProfileId),
    pgPolicy("classes_select", {
      as: "permissive",
      for: "select",
      to: "authenticated",
      using: sql`${t.teacherProfileId} = (select auth.uid()) or ${anggotaKelas(t.id)}`,
    }),
    pgPolicy("classes_write", {
      as: "permissive",
      for: "all",
      to: "authenticated",
      using: sql`${t.teacherProfileId} = (select auth.uid())`,
      withCheck: sql`${t.teacherProfileId} = (select auth.uid())`,
    }),
  ],
);

/* ------------------------------ class_members ------------------------------ */

export const classMembers = pgTable(
  "class_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    classId: uuid("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    studentProfileId: uuid("student_profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    unique("class_members_class_student_uq").on(t.classId, t.studentProfileId),
    index("class_members_student_idx").on(t.studentProfileId),
    pgPolicy("class_members_select", {
      as: "permissive",
      for: "select",
      to: "authenticated",
      using: sql`${t.studentProfileId} = (select auth.uid()) or ${guruKelas(t.classId)}`,
    }),
    pgPolicy("class_members_write", {
      as: "permissive",
      for: "all",
      to: "authenticated",
      using: guruKelas(t.classId),
      withCheck: guruKelas(t.classId),
    }),
  ],
);

/* ------------------------------- assignments ------------------------------- */

export const assignments = pgTable(
  "assignments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    authorProfileId: uuid("author_profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    classId: uuid("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    dueDate: timestamp("due_date", { withTimezone: true }).notNull(),
    submissionType: tugasTipeEnum("submission_type").notNull().default("teks"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("assignments_class_idx").on(t.classId, t.dueDate),
    pgPolicy("assignments_select", {
      as: "permissive",
      for: "select",
      to: "authenticated",
      using: sql`${guruKelas(t.classId)} or ${anggotaKelas(t.classId)}`,
    }),
    pgPolicy("assignments_write", {
      as: "permissive",
      for: "all",
      to: "authenticated",
      using: guruKelas(t.classId),
      withCheck: sql`${t.authorProfileId} = (select auth.uid()) and ${guruKelas(t.classId)}`,
    }),
  ],
);

/* ------------------------------- submissions ------------------------------- */

export const submissions = pgTable(
  "submissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    assignmentId: uuid("assignment_id")
      .notNull()
      .references(() => assignments.id, { onDelete: "cascade" }),
    studentProfileId: uuid("student_profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    content: text("content"),
    fileUrl: text("file_url"),
    status: submissionStatusEnum("status").notNull().default("terkumpul"),
    grade: integer("grade"),
    feedback: text("feedback"),
    gradedByProfileId: uuid("graded_by_profile_id").references(
      () => profiles.id,
      { onDelete: "set null" },
    ),
    submittedAt: timestamp("submitted_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    gradedAt: timestamp("graded_at", { withTimezone: true }),
  },
  (t) => [
    unique("submissions_assignment_student_uq").on(
      t.assignmentId,
      t.studentProfileId,
    ),
    index("submissions_student_idx").on(t.studentProfileId),
    // Baca: siswa pemilik atau guru kelas dari tugas.
    pgPolicy("submissions_select", {
      as: "permissive",
      for: "select",
      to: "authenticated",
      using: sql`${t.studentProfileId} = (select auth.uid()) or ${guruDariTugas(t.assignmentId)}`,
    }),
    // Kumpulkan: siswa anggota kelas mengumpulkan miliknya.
    pgPolicy("submissions_insert", {
      as: "permissive",
      for: "insert",
      to: "authenticated",
      withCheck: sql`${t.studentProfileId} = (select auth.uid()) and ${anggotaDariTugas(t.assignmentId)}`,
    }),
    // Ubah: siswa pemilik (revisi) atau guru kelas (menilai).
    pgPolicy("submissions_update", {
      as: "permissive",
      for: "update",
      to: "authenticated",
      using: sql`${t.studentProfileId} = (select auth.uid()) or ${guruDariTugas(t.assignmentId)}`,
      withCheck: sql`${t.studentProfileId} = (select auth.uid()) or ${guruDariTugas(t.assignmentId)}`,
    }),
  ],
);

export type ClassRow = typeof classes.$inferSelect;
export type NewClassRow = typeof classes.$inferInsert;
export type ClassMember = typeof classMembers.$inferSelect;
export type NewClassMember = typeof classMembers.$inferInsert;
export type Assignment = typeof assignments.$inferSelect;
export type NewAssignment = typeof assignments.$inferInsert;
export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
