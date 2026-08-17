import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

import { profiles } from "./profiles";

/**
 * Progres belajar per mata pelajaran — menyuplai "Ringkasan Progres" di
 * Beranda (penguasaan mapel, jumlah soal, rata-rata nilai). Satu baris per
 * pasangan (pengguna, mapel).
 */
export const learningProgress = pgTable(
  "learning_progress",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    mapel: text("mapel").notNull(),
    // 0–100, tingkat penguasaan mapel.
    masteryPercent: integer("mastery_percent").notNull().default(0),
    soalDikerjakan: integer("soal_dikerjakan").notNull().default(0),
    // rata-rata nilai 0–100; null bila belum ada latihan.
    rataRataNilai: integer("rata_rata_nilai"),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [unique("learning_progress_profile_mapel_uq").on(t.profileId, t.mapel)],
);

export type LearningProgress = typeof learningProgress.$inferSelect;
export type NewLearningProgress = typeof learningProgress.$inferInsert;
