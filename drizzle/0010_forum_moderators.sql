CREATE TABLE "forum_moderators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_forum_id" uuid NOT NULL,
	"profile_id" uuid NOT NULL,
	"appointed_by_profile_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "forum_moderators_forum_profile_uq" UNIQUE("school_forum_id","profile_id")
);
--> statement-breakpoint
ALTER TABLE "forum_moderators" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "forum_moderators" ADD CONSTRAINT "forum_moderators_school_forum_id_school_forums_id_fk" FOREIGN KEY ("school_forum_id") REFERENCES "public"."school_forums"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_moderators" ADD CONSTRAINT "forum_moderators_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_moderators" ADD CONSTRAINT "forum_moderators_appointed_by_profile_id_profiles_id_fk" FOREIGN KEY ("appointed_by_profile_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "forum_moderators_select" ON "forum_moderators" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (
  select 1 from profiles p
  where p.id = (select auth.uid()) and p.school_id = (select sf.school_id from school_forums sf where sf.id = "forum_moderators"."school_forum_id")
));--> statement-breakpoint
CREATE POLICY "forum_moderators_write" ON "forum_moderators" AS PERMISSIVE FOR ALL TO "authenticated" USING (exists (
  select 1 from profiles p
  where p.id = (select auth.uid()) and p.role = 'admin' and p.school_id = (select sf.school_id from school_forums sf where sf.id = "forum_moderators"."school_forum_id")
)) WITH CHECK (exists (
  select 1 from profiles p
  where p.id = (select auth.uid()) and p.role = 'admin' and p.school_id = (select sf.school_id from school_forums sf where sf.id = "forum_moderators"."school_forum_id")
));