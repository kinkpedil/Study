import {
  pgTable,
  uuid,
  timestamp,
  index,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { profiles } from "./profiles";
import {
  reportTargetTypeEnum,
  reportReasonEnum,
  reportStatusEnum,
} from "./enums";

/**
 * Laporan konten forum (topik/balasan). RLS:
 *  - Semua pengguna terautentikasi bisa melapor (reporter = auth.uid()).
 *  - Pelapor melihat laporannya sendiri; moderator (guru/admin) melihat semua.
 *  - Hanya moderator yang meninjau (update).
 */

const isModerator = sql`exists (
  select 1 from profiles p where p.id = (select auth.uid()) and p.role in ('guru','admin')
)`;

export const reports = pgTable(
  "reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reporterProfileId: uuid("reporter_profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    targetType: reportTargetTypeEnum("target_type").notNull(),
    // Polimorfik: id topik atau balasan (bukan FK).
    targetId: uuid("target_id").notNull(),
    reason: reportReasonEnum("reason").notNull(),
    status: reportStatusEnum("status").notNull().default("menunggu"),
    handledByProfileId: uuid("handled_by_profile_id").references(
      () => profiles.id,
      { onDelete: "set null" },
    ),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("reports_status_idx").on(t.status, t.createdAt),
    index("reports_target_idx").on(t.targetType, t.targetId),
    pgPolicy("reports_select", {
      as: "permissive",
      for: "select",
      to: "authenticated",
      using: sql`${t.reporterProfileId} = (select auth.uid()) or ${isModerator}`,
    }),
    pgPolicy("reports_insert", {
      as: "permissive",
      for: "insert",
      to: "authenticated",
      withCheck: sql`${t.reporterProfileId} = (select auth.uid())`,
    }),
    pgPolicy("reports_update", {
      as: "permissive",
      for: "update",
      to: "authenticated",
      using: isModerator,
      withCheck: isModerator,
    }),
  ],
);

export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
