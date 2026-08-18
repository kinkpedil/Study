import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { profiles } from "./profiles";
import { jenjangEnum, forumScopeEnum, moderationStatusEnum } from "./enums";

/**
 * Skema forum: topik (threads) & balasan (posts). RLS menegakkan aturan
 * berjenjang PRD:
 *  - scope "umum": terlihat semua pengguna terautentikasi.
 *  - scope "jenjang": hanya terlihat siswa dengan jenjang yang sama; guru/admin
 *    (moderator) boleh melihat semua jenjang.
 *  - Menulis: hanya penulisnya sendiri (author_profile_id = auth.uid()).
 *  - Post yang `removed` disembunyikan dari non-moderator.
 */

/* SQL: apakah topik dengan (scope, audience_jenjang) terlihat oleh user login. */
function threadTerlihat(scopeCol: unknown, audienceCol: unknown) {
  return sql`(
    ${scopeCol} = 'umum'
    or (${scopeCol} = 'jenjang' and exists (
      select 1 from profiles p
      where p.id = (select auth.uid())
        and (p.role in ('guru','admin') or p.jenjang = ${audienceCol})
    ))
  )`;
}

const isModerator = sql`exists (
  select 1 from profiles p where p.id = (select auth.uid()) and p.role in ('guru','admin')
)`;

/* ------------------------------ forum_threads ------------------------------ */

export const forumThreads = pgTable(
  "forum_threads",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    authorProfileId: uuid("author_profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    scope: forumScopeEnum("scope").notNull().default("umum"),
    // Diisi untuk scope "jenjang"; null untuk "umum".
    audienceJenjang: jenjangEnum("audience_jenjang"),
    category: text("category").notNull().default("Umum"),
    title: text("title").notNull(),
    body: text("body").notNull(),
    moderationStatus: moderationStatusEnum("moderation_status")
      .notNull()
      .default("visible"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("forum_threads_scope_idx").on(t.scope, t.audienceJenjang),
    index("forum_threads_author_idx").on(t.authorProfileId),
    pgPolicy("forum_threads_select", {
      as: "permissive",
      for: "select",
      to: "authenticated",
      using: sql`${threadTerlihat(t.scope, t.audienceJenjang)} and (${t.moderationStatus} <> 'removed' or ${isModerator})`,
    }),
    pgPolicy("forum_threads_insert", {
      as: "permissive",
      for: "insert",
      to: "authenticated",
      withCheck: sql`${t.authorProfileId} = (select auth.uid())`,
    }),
    pgPolicy("forum_threads_update", {
      as: "permissive",
      for: "update",
      to: "authenticated",
      using: sql`${t.authorProfileId} = (select auth.uid()) or ${isModerator}`,
      withCheck: sql`${t.authorProfileId} = (select auth.uid()) or ${isModerator}`,
    }),
    pgPolicy("forum_threads_delete", {
      as: "permissive",
      for: "delete",
      to: "authenticated",
      using: sql`${t.authorProfileId} = (select auth.uid()) or ${isModerator}`,
    }),
  ],
);

/* ------------------------------- forum_posts ------------------------------- */

export const forumPosts = pgTable(
  "forum_posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    threadId: uuid("thread_id")
      .notNull()
      .references(() => forumThreads.id, { onDelete: "cascade" }),
    authorProfileId: uuid("author_profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    moderationStatus: moderationStatusEnum("moderation_status")
      .notNull()
      .default("visible"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("forum_posts_thread_idx").on(t.threadId, t.createdAt),
    // Terlihat bila topik induk terlihat & (tidak removed atau moderator).
    pgPolicy("forum_posts_select", {
      as: "permissive",
      for: "select",
      to: "authenticated",
      using: sql`exists (
        select 1 from forum_threads th
        where th.id = ${t.threadId}
          and ${threadTerlihat(sql`th.scope`, sql`th.audience_jenjang`)}
      ) and (${t.moderationStatus} <> 'removed' or ${isModerator})`,
    }),
    pgPolicy("forum_posts_insert", {
      as: "permissive",
      for: "insert",
      to: "authenticated",
      withCheck: sql`${t.authorProfileId} = (select auth.uid()) and exists (
        select 1 from forum_threads th
        where th.id = ${t.threadId}
          and ${threadTerlihat(sql`th.scope`, sql`th.audience_jenjang`)}
      )`,
    }),
    pgPolicy("forum_posts_update", {
      as: "permissive",
      for: "update",
      to: "authenticated",
      using: sql`${t.authorProfileId} = (select auth.uid()) or ${isModerator}`,
      withCheck: sql`${t.authorProfileId} = (select auth.uid()) or ${isModerator}`,
    }),
    pgPolicy("forum_posts_delete", {
      as: "permissive",
      for: "delete",
      to: "authenticated",
      using: sql`${t.authorProfileId} = (select auth.uid()) or ${isModerator}`,
    }),
  ],
);

export type ForumThreadRow = typeof forumThreads.$inferSelect;
export type NewForumThreadRow = typeof forumThreads.$inferInsert;
export type ForumPostRow = typeof forumPosts.$inferSelect;
export type NewForumPostRow = typeof forumPosts.$inferInsert;
