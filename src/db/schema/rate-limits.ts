import {
  pgTable,
  text,
  integer,
  timestamp,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * Penghitung rate limit (fixed window) berbagi lintas instance via Postgres.
 * Hanya diakses server (peran postgres/service yang melewati RLS); RLS
 * mengunci akses langsung dari klien (anon/authenticated ditolak).
 */
export const rateLimits = pgTable(
  "rate_limits",
  {
    key: text("key").primaryKey(),
    count: integer("count").notNull().default(0),
    windowStart: timestamp("window_start", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  () => [
    pgPolicy("rate_limits_deny_all", {
      as: "permissive",
      for: "all",
      to: "authenticated",
      using: sql`false`,
    }),
  ],
);
