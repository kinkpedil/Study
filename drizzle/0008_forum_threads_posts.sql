CREATE TYPE "public"."forum_scope" AS ENUM('jenjang', 'umum');--> statement-breakpoint
CREATE TYPE "public"."moderation_status" AS ENUM('visible', 'flagged', 'removed');--> statement-breakpoint
CREATE TABLE "forum_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"thread_id" uuid NOT NULL,
	"author_profile_id" uuid NOT NULL,
	"content" text NOT NULL,
	"moderation_status" "moderation_status" DEFAULT 'visible' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "forum_posts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "forum_threads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_profile_id" uuid NOT NULL,
	"scope" "forum_scope" DEFAULT 'umum' NOT NULL,
	"audience_jenjang" "jenjang",
	"category" text DEFAULT 'Umum' NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"moderation_status" "moderation_status" DEFAULT 'visible' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "forum_threads" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_thread_id_forum_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."forum_threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_author_profile_id_profiles_id_fk" FOREIGN KEY ("author_profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_threads" ADD CONSTRAINT "forum_threads_author_profile_id_profiles_id_fk" FOREIGN KEY ("author_profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "forum_posts_thread_idx" ON "forum_posts" USING btree ("thread_id","created_at");--> statement-breakpoint
CREATE INDEX "forum_threads_scope_idx" ON "forum_threads" USING btree ("scope","audience_jenjang");--> statement-breakpoint
CREATE INDEX "forum_threads_author_idx" ON "forum_threads" USING btree ("author_profile_id");--> statement-breakpoint
CREATE POLICY "forum_posts_select" ON "forum_posts" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (
        select 1 from forum_threads th
        where th.id = "forum_posts"."thread_id"
          and (
    th.scope = 'umum'
    or (th.scope = 'jenjang' and exists (
      select 1 from profiles p
      where p.id = (select auth.uid())
        and (p.role in ('guru','admin') or p.jenjang = th.audience_jenjang)
    ))
  )
      ) and ("forum_posts"."moderation_status" <> 'removed' or exists (
  select 1 from profiles p where p.id = (select auth.uid()) and p.role in ('guru','admin')
)));--> statement-breakpoint
CREATE POLICY "forum_posts_insert" ON "forum_posts" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("forum_posts"."author_profile_id" = (select auth.uid()) and exists (
        select 1 from forum_threads th
        where th.id = "forum_posts"."thread_id"
          and (
    th.scope = 'umum'
    or (th.scope = 'jenjang' and exists (
      select 1 from profiles p
      where p.id = (select auth.uid())
        and (p.role in ('guru','admin') or p.jenjang = th.audience_jenjang)
    ))
  )
      ));--> statement-breakpoint
CREATE POLICY "forum_posts_update" ON "forum_posts" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("forum_posts"."author_profile_id" = (select auth.uid()) or exists (
  select 1 from profiles p where p.id = (select auth.uid()) and p.role in ('guru','admin')
)) WITH CHECK ("forum_posts"."author_profile_id" = (select auth.uid()) or exists (
  select 1 from profiles p where p.id = (select auth.uid()) and p.role in ('guru','admin')
));--> statement-breakpoint
CREATE POLICY "forum_posts_delete" ON "forum_posts" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("forum_posts"."author_profile_id" = (select auth.uid()) or exists (
  select 1 from profiles p where p.id = (select auth.uid()) and p.role in ('guru','admin')
));--> statement-breakpoint
CREATE POLICY "forum_threads_select" ON "forum_threads" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((
    "forum_threads"."scope" = 'umum'
    or ("forum_threads"."scope" = 'jenjang' and exists (
      select 1 from profiles p
      where p.id = (select auth.uid())
        and (p.role in ('guru','admin') or p.jenjang = "forum_threads"."audience_jenjang")
    ))
  ) and ("forum_threads"."moderation_status" <> 'removed' or exists (
  select 1 from profiles p where p.id = (select auth.uid()) and p.role in ('guru','admin')
)));--> statement-breakpoint
CREATE POLICY "forum_threads_insert" ON "forum_threads" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("forum_threads"."author_profile_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "forum_threads_update" ON "forum_threads" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("forum_threads"."author_profile_id" = (select auth.uid()) or exists (
  select 1 from profiles p where p.id = (select auth.uid()) and p.role in ('guru','admin')
)) WITH CHECK ("forum_threads"."author_profile_id" = (select auth.uid()) or exists (
  select 1 from profiles p where p.id = (select auth.uid()) and p.role in ('guru','admin')
));--> statement-breakpoint
CREATE POLICY "forum_threads_delete" ON "forum_threads" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("forum_threads"."author_profile_id" = (select auth.uid()) or exists (
  select 1 from profiles p where p.id = (select auth.uid()) and p.role in ('guru','admin')
));