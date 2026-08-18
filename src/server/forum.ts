import "server-only";

import { and, or, eq, ne, desc, sql, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { forumThreads, forumPosts, profiles } from "@/db/schema";
import type { Profile } from "@/db/schema";

export interface ThreadRingkas {
  id: string;
  scope: string;
  audienceJenjang: string | null;
  category: string;
  title: string;
  body: string;
  penulis: string;
  penulisRole: string;
  balasan: number;
  createdAt: string;
}

function isModerator(profile: Profile) {
  return profile.role === "guru" || profile.role === "admin";
}

/**
 * Daftar topik forum yang boleh diakses pengguna sesuai aturan berjenjang:
 * - umum: semua pengguna
 * - jenjang: hanya siswa dengan jenjang sama; guru/admin melihat semua jenjang
 * Post/topik `removed` disembunyikan dari non-moderator.
 */
export async function listThreads(
  profile: Profile,
  opts: { scope?: "jenjang" | "umum"; category?: string; limit?: number } = {},
): Promise<ThreadRingkas[]> {
  const limit = Math.min(Math.max(opts.limit ?? 30, 1), 50);
  const mod = isModerator(profile);

  const akses: SQL = mod
    ? // Moderator: semua umum + semua jenjang.
      sql`(${forumThreads.scope} = 'umum' or ${forumThreads.scope} = 'jenjang')`
    : // Siswa: umum, atau jenjang yang cocok dengan jenjangnya.
      (or(
        eq(forumThreads.scope, "umum"),
        and(
          eq(forumThreads.scope, "jenjang"),
          profile.jenjang
            ? eq(forumThreads.audienceJenjang, profile.jenjang)
            : sql`false`,
        ),
      ) as SQL);

  const conds: SQL[] = [akses];
  if (!mod) conds.push(ne(forumThreads.moderationStatus, "removed"));
  if (opts.scope) conds.push(eq(forumThreads.scope, opts.scope));
  if (opts.category) conds.push(eq(forumThreads.category, opts.category));

  const rows = await db
    .select({
      id: forumThreads.id,
      scope: forumThreads.scope,
      audienceJenjang: forumThreads.audienceJenjang,
      category: forumThreads.category,
      title: forumThreads.title,
      body: forumThreads.body,
      penulis: profiles.fullName,
      penulisRole: profiles.role,
      createdAt: forumThreads.createdAt,
      balasan: sql<number>`(
        select count(*)::int from ${forumPosts} fp
        where fp.thread_id = ${forumThreads.id} and fp.moderation_status <> 'removed'
      )`,
    })
    .from(forumThreads)
    .innerJoin(profiles, eq(forumThreads.authorProfileId, profiles.id))
    .where(and(...conds))
    .orderBy(desc(forumThreads.createdAt))
    .limit(limit);

  return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
}
