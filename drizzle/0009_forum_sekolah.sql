CREATE TYPE "public"."complaint_status" AS ENUM('baru', 'diproses', 'selesai');--> statement-breakpoint
CREATE TYPE "public"."complaint_visibility" AS ENUM('privat', 'publik');--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_forum_id" uuid NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"created_by_profile_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "announcements" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "complaints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_forum_id" uuid NOT NULL,
	"student_profile_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"visibility" "complaint_visibility" DEFAULT 'privat' NOT NULL,
	"status" "complaint_status" DEFAULT 'baru' NOT NULL,
	"resolution_note" text,
	"handled_by_profile_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "complaints" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "school_forums" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_by_profile_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "school_forums" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_school_forum_id_school_forums_id_fk" FOREIGN KEY ("school_forum_id") REFERENCES "public"."school_forums"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_created_by_profile_id_profiles_id_fk" FOREIGN KEY ("created_by_profile_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_school_forum_id_school_forums_id_fk" FOREIGN KEY ("school_forum_id") REFERENCES "public"."school_forums"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_student_profile_id_profiles_id_fk" FOREIGN KEY ("student_profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_handled_by_profile_id_profiles_id_fk" FOREIGN KEY ("handled_by_profile_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_forums" ADD CONSTRAINT "school_forums_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_forums" ADD CONSTRAINT "school_forums_created_by_profile_id_profiles_id_fk" FOREIGN KEY ("created_by_profile_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "announcements_forum_idx" ON "announcements" USING btree ("school_forum_id","created_at");--> statement-breakpoint
CREATE INDEX "complaints_forum_idx" ON "complaints" USING btree ("school_forum_id","created_at");--> statement-breakpoint
CREATE INDEX "complaints_student_idx" ON "complaints" USING btree ("student_profile_id");--> statement-breakpoint
CREATE INDEX "school_forums_school_idx" ON "school_forums" USING btree ("school_id");--> statement-breakpoint
CREATE POLICY "announcements_select" ON "announcements" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (
  select 1 from profiles p
  where p.id = (select auth.uid()) and p.school_id = (select sf.school_id from school_forums sf where sf.id = "announcements"."school_forum_id")
));--> statement-breakpoint
CREATE POLICY "announcements_write" ON "announcements" AS PERMISSIVE FOR ALL TO "authenticated" USING (exists (
  select 1 from profiles p
  where p.id = (select auth.uid()) and p.role = 'admin' and p.school_id = (select sf.school_id from school_forums sf where sf.id = "announcements"."school_forum_id")
)) WITH CHECK (exists (
  select 1 from profiles p
  where p.id = (select auth.uid()) and p.role = 'admin' and p.school_id = (select sf.school_id from school_forums sf where sf.id = "announcements"."school_forum_id")
));--> statement-breakpoint
CREATE POLICY "complaints_select" ON "complaints" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("complaints"."student_profile_id" = (select auth.uid())
        or ("complaints"."visibility" = 'publik' and exists (
  select 1 from profiles p
  where p.id = (select auth.uid()) and p.school_id = (select sf.school_id from school_forums sf where sf.id = "complaints"."school_forum_id")
))
        or exists (
  select 1 from profiles p
  where p.id = (select auth.uid()) and p.role = 'admin' and p.school_id = (select sf.school_id from school_forums sf where sf.id = "complaints"."school_forum_id")
));--> statement-breakpoint
CREATE POLICY "complaints_insert" ON "complaints" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("complaints"."student_profile_id" = (select auth.uid())
        and exists (
  select 1 from profiles p
  where p.id = (select auth.uid()) and p.school_id = (select sf.school_id from school_forums sf where sf.id = "complaints"."school_forum_id")
));--> statement-breakpoint
CREATE POLICY "complaints_update" ON "complaints" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("complaints"."student_profile_id" = (select auth.uid()) or exists (
  select 1 from profiles p
  where p.id = (select auth.uid()) and p.role = 'admin' and p.school_id = (select sf.school_id from school_forums sf where sf.id = "complaints"."school_forum_id")
)) WITH CHECK ("complaints"."student_profile_id" = (select auth.uid()) or exists (
  select 1 from profiles p
  where p.id = (select auth.uid()) and p.role = 'admin' and p.school_id = (select sf.school_id from school_forums sf where sf.id = "complaints"."school_forum_id")
));--> statement-breakpoint
CREATE POLICY "complaints_delete" ON "complaints" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("complaints"."student_profile_id" = (select auth.uid()) or exists (
  select 1 from profiles p
  where p.id = (select auth.uid()) and p.role = 'admin' and p.school_id = (select sf.school_id from school_forums sf where sf.id = "complaints"."school_forum_id")
));--> statement-breakpoint
CREATE POLICY "school_forums_select" ON "school_forums" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (
  select 1 from profiles p
  where p.id = (select auth.uid()) and p.school_id = "school_forums"."school_id"
));--> statement-breakpoint
CREATE POLICY "school_forums_write" ON "school_forums" AS PERMISSIVE FOR ALL TO "authenticated" USING (exists (
  select 1 from profiles p
  where p.id = (select auth.uid()) and p.role = 'admin' and p.school_id = "school_forums"."school_id"
)) WITH CHECK (exists (
  select 1 from profiles p
  where p.id = (select auth.uid()) and p.role = 'admin' and p.school_id = "school_forums"."school_id"
));