import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Sekolah — entitas dasar yang menaungi profil, kelas, dan forum sekolah.
 */
export const schools = pgTable("schools", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  npsn: text("npsn"),
  address: text("address"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type School = typeof schools.$inferSelect;
export type NewSchool = typeof schools.$inferInsert;
