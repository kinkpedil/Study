CREATE TYPE "public"."kesulitan" AS ENUM('mudah', 'sedang', 'sulit');--> statement-breakpoint
CREATE TYPE "public"."soal_tipe" AS ENUM('pilihan_ganda', 'esai');--> statement-breakpoint
CREATE TABLE "answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"jawaban" text,
	"benar" boolean,
	CONSTRAINT "answers_attempt_question_uq" UNIQUE("attempt_id","question_id")
);
--> statement-breakpoint
ALTER TABLE "answers" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exercise_set_id" uuid NOT NULL,
	"profile_id" uuid NOT NULL,
	"score" integer,
	"benar" integer,
	"total" integer,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "attempts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "exercise_sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_profile_id" uuid NOT NULL,
	"judul" text NOT NULL,
	"jenjang" "jenjang" NOT NULL,
	"kelas" text NOT NULL,
	"mapel" text NOT NULL,
	"topik" text,
	"kesulitan" "kesulitan" DEFAULT 'sedang' NOT NULL,
	"jumlah_soal" integer DEFAULT 0 NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "exercise_sets" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exercise_set_id" uuid NOT NULL,
	"nomor" integer NOT NULL,
	"tipe" "soal_tipe" DEFAULT 'pilihan_ganda' NOT NULL,
	"pertanyaan" text NOT NULL,
	"opsi" jsonb,
	"kunci" text NOT NULL,
	"pembahasan" text,
	CONSTRAINT "questions_set_nomor_uq" UNIQUE("exercise_set_id","nomor")
);
--> statement-breakpoint
ALTER TABLE "questions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_attempt_id_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_exercise_set_id_exercise_sets_id_fk" FOREIGN KEY ("exercise_set_id") REFERENCES "public"."exercise_sets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_sets" ADD CONSTRAINT "exercise_sets_author_profile_id_profiles_id_fk" FOREIGN KEY ("author_profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_exercise_set_id_exercise_sets_id_fk" FOREIGN KEY ("exercise_set_id") REFERENCES "public"."exercise_sets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attempts_profile_idx" ON "attempts" USING btree ("profile_id","started_at");--> statement-breakpoint
CREATE INDEX "exercise_sets_author_idx" ON "exercise_sets" USING btree ("author_profile_id");--> statement-breakpoint
CREATE POLICY "answers_owner" ON "answers" AS PERMISSIVE FOR ALL TO "authenticated" USING (exists (select 1 from attempts a where a.id = "answers"."attempt_id" and a.profile_id = (select auth.uid()))) WITH CHECK (exists (select 1 from attempts a where a.id = "answers"."attempt_id" and a.profile_id = (select auth.uid())));--> statement-breakpoint
CREATE POLICY "attempts_owner" ON "attempts" AS PERMISSIVE FOR ALL TO "authenticated" USING ("attempts"."profile_id" = (select auth.uid())) WITH CHECK ("attempts"."profile_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "exercise_sets_select" ON "exercise_sets" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("exercise_sets"."author_profile_id" = (select auth.uid()) or "exercise_sets"."is_public");--> statement-breakpoint
CREATE POLICY "exercise_sets_insert" ON "exercise_sets" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("exercise_sets"."author_profile_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "exercise_sets_update" ON "exercise_sets" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("exercise_sets"."author_profile_id" = (select auth.uid())) WITH CHECK ("exercise_sets"."author_profile_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "exercise_sets_delete" ON "exercise_sets" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("exercise_sets"."author_profile_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "questions_select" ON "questions" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from exercise_sets es where es.id = "questions"."exercise_set_id" and (es.author_profile_id = (select auth.uid()) or es.is_public)));--> statement-breakpoint
CREATE POLICY "questions_write" ON "questions" AS PERMISSIVE FOR ALL TO "authenticated" USING (exists (select 1 from exercise_sets es where es.id = "questions"."exercise_set_id" and es.author_profile_id = (select auth.uid()))) WITH CHECK (exists (select 1 from exercise_sets es where es.id = "questions"."exercise_set_id" and es.author_profile_id = (select auth.uid())));