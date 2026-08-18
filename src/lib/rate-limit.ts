import "server-only";

import { sql } from "drizzle-orm";

import { db } from "@/db";
import { rateLimits } from "@/db/schema";

export interface RateLimitResult {
  allowed: boolean;
  /** Detik hingga jendela reset (untuk header Retry-After). */
  retryAfter: number;
}

/**
 * Rate limit fixed-window berbagi via Postgres. Satu baris per `key`; saat
 * jendela lama kedaluwarsa, hitungan direset secara atomik dalam upsert.
 * `key` sebaiknya menyertakan aksi + id pengguna, mis. `forum:thread:<uid>`.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSec: number,
): Promise<RateLimitResult> {
  try {
    const rows = await db
      .insert(rateLimits)
      .values({ key, count: 1, windowStart: sql`now()` })
      .onConflictDoUpdate({
        target: rateLimits.key,
        set: {
          count: sql`case when ${rateLimits.windowStart} < now() - (${windowSec} * interval '1 second')
                       then 1 else ${rateLimits.count} + 1 end`,
          windowStart: sql`case when ${rateLimits.windowStart} < now() - (${windowSec} * interval '1 second')
                             then now() else ${rateLimits.windowStart} end`,
        },
      })
      .returning({
        count: rateLimits.count,
        // Detik tersisa pada jendela ini.
        sisa: sql<number>`greatest(0, ceil(extract(epoch from (${rateLimits.windowStart} + (${windowSec} * interval '1 second') - now()))))::int`,
      });

    const row = rows[0];
    const allowed = (row?.count ?? 1) <= limit;
    return { allowed, retryAfter: allowed ? 0 : (row?.sisa ?? windowSec) };
  } catch {
    // Fail-open bila store bermasalah, agar tidak memblokir pengguna sah.
    return { allowed: true, retryAfter: 0 };
  }
}

/** Respons 429 standar dengan header Retry-After. */
export function tooManyRequests(retryAfter: number): Response {
  return new Response(
    JSON.stringify({
      error: "Terlalu banyak permintaan. Coba lagi sebentar.",
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(Math.max(1, retryAfter)),
      },
    },
  );
}
