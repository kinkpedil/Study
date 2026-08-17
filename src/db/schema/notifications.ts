import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";

import { profiles } from "./profiles";
import { notifTypeEnum } from "./enums";

/**
 * Notifikasi pengguna — sumber daftar "Notifikasi & Pengumuman" di Beranda.
 * `readAt` null berarti belum dibaca. `link` menautkan ke halaman terkait.
 */
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    type: notifTypeEnum("type").notNull().default("sistem"),
    title: text("title").notNull(),
    message: text("message").notNull(),
    link: text("link"),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    // Kueri umum: notifikasi milik satu pengguna, terbaru dulu.
    index("notifications_user_created_idx").on(t.userId, t.createdAt),
  ],
);

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
