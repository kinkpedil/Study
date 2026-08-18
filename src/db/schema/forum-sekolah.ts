import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
  unique,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { schools } from "./schools";
import { profiles } from "./profiles";
import { complaintVisibilityEnum, complaintStatusEnum } from "./enums";

/**
 * Skema Forum Sekolah: ruang forum sekolah, pengumuman, dan pengajuan masalah
 * (pengaduan). RLS berbasis keanggotaan sekolah:
 *  - Anggota sekolah (profiles.school_id = school_forums.school_id) bisa membaca.
 *  - Admin sekolah mengelola forum & pengumuman dan menindaklanjuti pengaduan.
 *  - Pengaduan: pelapor melihat miliknya; yang publik terlihat anggota sekolah;
 *    admin melihat semua.
 */

/* Predikat: user login adalah anggota sekolah `schoolIdExpr`. */
const anggotaSekolah = (schoolIdExpr: unknown) => sql`exists (
  select 1 from profiles p
  where p.id = (select auth.uid()) and p.school_id = ${schoolIdExpr}
)`;

/* Predikat: user login adalah ADMIN sekolah `schoolIdExpr`. */
const adminSekolah = (schoolIdExpr: unknown) => sql`exists (
  select 1 from profiles p
  where p.id = (select auth.uid()) and p.role = 'admin' and p.school_id = ${schoolIdExpr}
)`;

/* Sekolah dari sebuah school_forum (subquery, dipakai pada announcements/complaints). */
const sekolahDariForum = (forumIdExpr: unknown) =>
  sql`(select sf.school_id from school_forums sf where sf.id = ${forumIdExpr})`;

/* ------------------------------ school_forums ------------------------------ */

export const schoolForums = pgTable(
  "school_forums",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    schoolId: uuid("school_id")
      .notNull()
      .references(() => schools.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    createdByProfileId: uuid("created_by_profile_id").references(
      () => profiles.id,
      { onDelete: "set null" },
    ),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("school_forums_school_idx").on(t.schoolId),
    pgPolicy("school_forums_select", {
      as: "permissive",
      for: "select",
      to: "authenticated",
      using: anggotaSekolah(t.schoolId),
    }),
    pgPolicy("school_forums_write", {
      as: "permissive",
      for: "all",
      to: "authenticated",
      using: adminSekolah(t.schoolId),
      withCheck: adminSekolah(t.schoolId),
    }),
  ],
);

/* ------------------------------ announcements ------------------------------ */

export const announcements = pgTable(
  "announcements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    schoolForumId: uuid("school_forum_id")
      .notNull()
      .references(() => schoolForums.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    body: text("body").notNull(),
    createdByProfileId: uuid("created_by_profile_id").references(
      () => profiles.id,
      { onDelete: "set null" },
    ),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("announcements_forum_idx").on(t.schoolForumId, t.createdAt),
    pgPolicy("announcements_select", {
      as: "permissive",
      for: "select",
      to: "authenticated",
      using: anggotaSekolah(sekolahDariForum(t.schoolForumId)),
    }),
    pgPolicy("announcements_write", {
      as: "permissive",
      for: "all",
      to: "authenticated",
      using: adminSekolah(sekolahDariForum(t.schoolForumId)),
      withCheck: adminSekolah(sekolahDariForum(t.schoolForumId)),
    }),
  ],
);

/* ------------------------------- complaints ------------------------------- */

export const complaints = pgTable(
  "complaints",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    schoolForumId: uuid("school_forum_id")
      .notNull()
      .references(() => schoolForums.id, { onDelete: "cascade" }),
    studentProfileId: uuid("student_profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    visibility: complaintVisibilityEnum("visibility")
      .notNull()
      .default("privat"),
    status: complaintStatusEnum("status").notNull().default("baru"),
    resolutionNote: text("resolution_note"),
    handledByProfileId: uuid("handled_by_profile_id").references(
      () => profiles.id,
      { onDelete: "set null" },
    ),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("complaints_forum_idx").on(t.schoolForumId, t.createdAt),
    index("complaints_student_idx").on(t.studentProfileId),
    // Baca: pemilik, atau publik untuk anggota sekolah, atau admin sekolah.
    pgPolicy("complaints_select", {
      as: "permissive",
      for: "select",
      to: "authenticated",
      using: sql`${t.studentProfileId} = (select auth.uid())
        or (${t.visibility} = 'publik' and ${anggotaSekolah(sekolahDariForum(t.schoolForumId))})
        or ${adminSekolah(sekolahDariForum(t.schoolForumId))}`,
    }),
    // Buat: siswa membuat pengaduannya sendiri di sekolahnya.
    pgPolicy("complaints_insert", {
      as: "permissive",
      for: "insert",
      to: "authenticated",
      withCheck: sql`${t.studentProfileId} = (select auth.uid())
        and ${anggotaSekolah(sekolahDariForum(t.schoolForumId))}`,
    }),
    // Ubah: admin (status/resolusi) atau pemilik.
    pgPolicy("complaints_update", {
      as: "permissive",
      for: "update",
      to: "authenticated",
      using: sql`${t.studentProfileId} = (select auth.uid()) or ${adminSekolah(sekolahDariForum(t.schoolForumId))}`,
      withCheck: sql`${t.studentProfileId} = (select auth.uid()) or ${adminSekolah(sekolahDariForum(t.schoolForumId))}`,
    }),
    pgPolicy("complaints_delete", {
      as: "permissive",
      for: "delete",
      to: "authenticated",
      using: sql`${t.studentProfileId} = (select auth.uid()) or ${adminSekolah(sekolahDariForum(t.schoolForumId))}`,
    }),
  ],
);

/* --------------------------- forum_moderators --------------------------- */

/**
 * Moderator forum sekolah yang diangkat admin. RLS: anggota sekolah bisa
 * melihat daftar; hanya admin sekolah yang mengangkat/mencabut.
 */
export const forumModerators = pgTable(
  "forum_moderators",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    schoolForumId: uuid("school_forum_id")
      .notNull()
      .references(() => schoolForums.id, { onDelete: "cascade" }),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    appointedByProfileId: uuid("appointed_by_profile_id").references(
      () => profiles.id,
      { onDelete: "set null" },
    ),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    unique("forum_moderators_forum_profile_uq").on(t.schoolForumId, t.profileId),
    pgPolicy("forum_moderators_select", {
      as: "permissive",
      for: "select",
      to: "authenticated",
      using: anggotaSekolah(sekolahDariForum(t.schoolForumId)),
    }),
    pgPolicy("forum_moderators_write", {
      as: "permissive",
      for: "all",
      to: "authenticated",
      using: adminSekolah(sekolahDariForum(t.schoolForumId)),
      withCheck: adminSekolah(sekolahDariForum(t.schoolForumId)),
    }),
  ],
);

export type ForumModerator = typeof forumModerators.$inferSelect;
export type NewForumModerator = typeof forumModerators.$inferInsert;

export type SchoolForum = typeof schoolForums.$inferSelect;
export type NewSchoolForum = typeof schoolForums.$inferInsert;
export type Announcement = typeof announcements.$inferSelect;
export type NewAnnouncement = typeof announcements.$inferInsert;
export type Complaint = typeof complaints.$inferSelect;
export type NewComplaint = typeof complaints.$inferInsert;
