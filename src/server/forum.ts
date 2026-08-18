import "server-only";

import { and, or, eq, ne, desc, sql, type SQL } from "drizzle-orm";

import { db } from "@/db";
import {
  forumThreads,
  forumPosts,
  profiles,
  type Profile,
  type ForumThreadRow,
} from "@/db/schema";
import type {
  CreateThreadInput,
  CreatePostInput,
} from "@/lib/validation/forum";
import { moderasiKonten, laporSistem } from "./moderasi-ai";

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

export class ForumError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ForumError";
  }
}

/** Apakah pengguna boleh mengakses topik ini (aturan berjenjang). */
function threadDapatDiakses(profile: Profile, t: ForumThreadRow): boolean {
  if (t.moderationStatus === "removed" && !isModerator(profile)) return false;
  if (t.scope === "umum") return true;
  // scope jenjang
  return isModerator(profile) || t.audienceJenjang === profile.jenjang;
}

/**
 * Membuat topik. Untuk scope "jenjang", siswa hanya bisa menulis di jenjangnya
 * sendiri; guru/admin boleh memilih jenjang audiens.
 */
export async function createThread(
  profile: Profile,
  input: CreateThreadInput,
): Promise<{ id: string }> {
  let audience: "SD" | "SMP" | "SMA" | null = null;
  if (input.scope === "jenjang") {
    if (isModerator(profile)) {
      if (!input.audienceJenjang) {
        throw new ForumError("audienceJenjang wajib untuk scope jenjang.", 422);
      }
      audience = input.audienceJenjang;
    } else {
      if (!profile.jenjang) {
        throw new ForumError("Profil tanpa jenjang tak bisa menulis di ruang jenjang.", 403);
      }
      // Abaikan audiens dari klien; kunci ke jenjang siswa.
      audience = profile.jenjang;
    }
  }

  // Moderasi otomatis: blokir konten berbahaya, tandai yang mencurigakan.
  const mod = await moderasiKonten(`${input.title}\n${input.body}`);
  if (mod.tindakan === "blokir") {
    throw new ForumError(
      "Konten terdeteksi melanggar aturan komunitas. Mohon perbaiki.",
      422,
    );
  }

  const [row] = await db
    .insert(forumThreads)
    .values({
      authorProfileId: profile.id,
      scope: input.scope,
      audienceJenjang: audience,
      category: input.category,
      title: input.title,
      body: input.body,
      moderationStatus: mod.tindakan === "tandai" ? "flagged" : "visible",
    })
    .returning({ id: forumThreads.id });

  if (mod.tindakan === "tandai") {
    await laporSistem("thread", row.id, mod.kategori);
  }
  return { id: row.id };
}

export interface ThreadDetail {
  thread: {
    id: string;
    scope: string;
    audienceJenjang: string | null;
    category: string;
    title: string;
    body: string;
    penulis: string;
    penulisRole: string;
    createdAt: string;
  };
  posts: {
    id: string;
    penulis: string;
    penulisRole: string;
    content: string;
    createdAt: string;
  }[];
}

/** Detail topik + balasan, dengan pengecekan akses berjenjang. */
export async function getThreadDetail(
  profile: Profile,
  threadId: string,
): Promise<ThreadDetail> {
  const [t] = await db
    .select()
    .from(forumThreads)
    .where(eq(forumThreads.id, threadId))
    .limit(1);
  if (!t) throw new ForumError("Topik tidak ditemukan.", 404);
  if (!threadDapatDiakses(profile, t)) {
    throw new ForumError("Tidak berwenang mengakses topik ini.", 403);
  }

  const [penulis] = await db
    .select({ nama: profiles.fullName, role: profiles.role })
    .from(profiles)
    .where(eq(profiles.id, t.authorProfileId))
    .limit(1);

  const postConds: SQL[] = [eq(forumPosts.threadId, threadId)];
  if (!isModerator(profile))
    postConds.push(ne(forumPosts.moderationStatus, "removed"));

  const posts = await db
    .select({
      id: forumPosts.id,
      penulis: profiles.fullName,
      penulisRole: profiles.role,
      content: forumPosts.content,
      createdAt: forumPosts.createdAt,
    })
    .from(forumPosts)
    .innerJoin(profiles, eq(forumPosts.authorProfileId, profiles.id))
    .where(and(...postConds))
    .orderBy(forumPosts.createdAt);

  return {
    thread: {
      id: t.id,
      scope: t.scope,
      audienceJenjang: t.audienceJenjang,
      category: t.category,
      title: t.title,
      body: t.body,
      penulis: penulis?.nama ?? "Pengguna",
      penulisRole: penulis?.role ?? "siswa",
      createdAt: t.createdAt.toISOString(),
    },
    posts: posts.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() })),
  };
}

/** Membalas topik (harus punya akses ke topik tersebut). */
export async function createPost(
  profile: Profile,
  threadId: string,
  input: CreatePostInput,
): Promise<{ id: string }> {
  const [t] = await db
    .select()
    .from(forumThreads)
    .where(eq(forumThreads.id, threadId))
    .limit(1);
  if (!t) throw new ForumError("Topik tidak ditemukan.", 404);
  if (!threadDapatDiakses(profile, t)) {
    throw new ForumError("Tidak berwenang membalas topik ini.", 403);
  }

  const mod = await moderasiKonten(input.content);
  if (mod.tindakan === "blokir") {
    throw new ForumError(
      "Balasan terdeteksi melanggar aturan komunitas. Mohon perbaiki.",
      422,
    );
  }

  const [row] = await db
    .insert(forumPosts)
    .values({
      threadId,
      authorProfileId: profile.id,
      content: input.content,
      moderationStatus: mod.tindakan === "tandai" ? "flagged" : "visible",
    })
    .returning({ id: forumPosts.id });

  if (mod.tindakan === "tandai") {
    await laporSistem("post", row.id, mod.kategori);
  }
  return { id: row.id };
}
