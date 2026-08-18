CREATE TYPE "public"."submission_status" AS ENUM('terkumpul', 'dinilai');--> statement-breakpoint
CREATE TYPE "public"."tugas_tipe" AS ENUM('teks', 'file');--> statement-breakpoint
CREATE TABLE "assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_profile_id" uuid NOT NULL,
	"class_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"due_date" timestamp with time zone NOT NULL,
	"submission_type" "tugas_tipe" DEFAULT 'teks' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assignments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "class_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_id" uuid NOT NULL,
	"student_profile_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "class_members_class_student_uq" UNIQUE("class_id","student_profile_id")
);
--> statement-breakpoint
ALTER TABLE "class_members" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "classes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teacher_profile_id" uuid NOT NULL,
	"school_id" uuid NOT NULL,
	"name" text NOT NULL,
	"mapel" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "classes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assignment_id" uuid NOT NULL,
	"student_profile_id" uuid NOT NULL,
	"content" text,
	"file_url" text,
	"status" "submission_status" DEFAULT 'terkumpul' NOT NULL,
	"grade" integer,
	"feedback" text,
	"graded_by_profile_id" uuid,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"graded_at" timestamp with time zone,
	CONSTRAINT "submissions_assignment_student_uq" UNIQUE("assignment_id","student_profile_id")
);
--> statement-breakpoint
ALTER TABLE "submissions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_author_profile_id_profiles_id_fk" FOREIGN KEY ("author_profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_members" ADD CONSTRAINT "class_members_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_members" ADD CONSTRAINT "class_members_student_profile_id_profiles_id_fk" FOREIGN KEY ("student_profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_teacher_profile_id_profiles_id_fk" FOREIGN KEY ("teacher_profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_assignment_id_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_student_profile_id_profiles_id_fk" FOREIGN KEY ("student_profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_graded_by_profile_id_profiles_id_fk" FOREIGN KEY ("graded_by_profile_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "assignments_class_idx" ON "assignments" USING btree ("class_id","due_date");--> statement-breakpoint
CREATE INDEX "class_members_student_idx" ON "class_members" USING btree ("student_profile_id");--> statement-breakpoint
CREATE INDEX "classes_teacher_idx" ON "classes" USING btree ("teacher_profile_id");--> statement-breakpoint
CREATE INDEX "submissions_student_idx" ON "submissions" USING btree ("student_profile_id");--> statement-breakpoint
CREATE POLICY "assignments_select" ON "assignments" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (
  select 1 from classes c
  where c.id = "assignments"."class_id" and c.teacher_profile_id = (select auth.uid())
) or exists (
  select 1 from class_members cm
  where cm.class_id = "assignments"."class_id" and cm.student_profile_id = (select auth.uid())
));--> statement-breakpoint
CREATE POLICY "assignments_write" ON "assignments" AS PERMISSIVE FOR ALL TO "authenticated" USING (exists (
  select 1 from classes c
  where c.id = "assignments"."class_id" and c.teacher_profile_id = (select auth.uid())
)) WITH CHECK ("assignments"."author_profile_id" = (select auth.uid()) and exists (
  select 1 from classes c
  where c.id = "assignments"."class_id" and c.teacher_profile_id = (select auth.uid())
));--> statement-breakpoint
CREATE POLICY "class_members_select" ON "class_members" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("class_members"."student_profile_id" = (select auth.uid()) or exists (
  select 1 from classes c
  where c.id = "class_members"."class_id" and c.teacher_profile_id = (select auth.uid())
));--> statement-breakpoint
CREATE POLICY "class_members_write" ON "class_members" AS PERMISSIVE FOR ALL TO "authenticated" USING (exists (
  select 1 from classes c
  where c.id = "class_members"."class_id" and c.teacher_profile_id = (select auth.uid())
)) WITH CHECK (exists (
  select 1 from classes c
  where c.id = "class_members"."class_id" and c.teacher_profile_id = (select auth.uid())
));--> statement-breakpoint
CREATE POLICY "classes_select" ON "classes" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("classes"."teacher_profile_id" = (select auth.uid()) or exists (
  select 1 from class_members cm
  where cm.class_id = "classes"."id" and cm.student_profile_id = (select auth.uid())
));--> statement-breakpoint
CREATE POLICY "classes_write" ON "classes" AS PERMISSIVE FOR ALL TO "authenticated" USING ("classes"."teacher_profile_id" = (select auth.uid())) WITH CHECK ("classes"."teacher_profile_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "submissions_select" ON "submissions" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("submissions"."student_profile_id" = (select auth.uid()) or exists (
  select 1 from assignments a join classes c on c.id = a.class_id
  where a.id = "submissions"."assignment_id" and c.teacher_profile_id = (select auth.uid())
));--> statement-breakpoint
CREATE POLICY "submissions_insert" ON "submissions" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("submissions"."student_profile_id" = (select auth.uid()) and exists (
  select 1 from assignments a join class_members cm on cm.class_id = a.class_id
  where a.id = "submissions"."assignment_id" and cm.student_profile_id = (select auth.uid())
));--> statement-breakpoint
CREATE POLICY "submissions_update" ON "submissions" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("submissions"."student_profile_id" = (select auth.uid()) or exists (
  select 1 from assignments a join classes c on c.id = a.class_id
  where a.id = "submissions"."assignment_id" and c.teacher_profile_id = (select auth.uid())
)) WITH CHECK ("submissions"."student_profile_id" = (select auth.uid()) or exists (
  select 1 from assignments a join classes c on c.id = a.class_id
  where a.id = "submissions"."assignment_id" and c.teacher_profile_id = (select auth.uid())
));