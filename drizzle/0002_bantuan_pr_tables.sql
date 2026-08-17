CREATE TYPE "public"."hw_msg_tipe" AS ENUM('pertanyaan', 'petunjuk', 'langkah', 'jawaban', 'klarifikasi');--> statement-breakpoint
CREATE TYPE "public"."hw_sender" AS ENUM('siswa', 'ai');--> statement-breakpoint
CREATE TYPE "public"."hw_status" AS ENUM('berlangsung', 'selesai');--> statement-breakpoint
CREATE TABLE "homework_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"sender" "hw_sender" NOT NULL,
	"tipe" "hw_msg_tipe" DEFAULT 'pertanyaan' NOT NULL,
	"content" text NOT NULL,
	"urutan" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "homework_messages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "homework_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"judul" text NOT NULL,
	"mapel" text NOT NULL,
	"jenjang" "jenjang",
	"pertanyaan" text NOT NULL,
	"foto_url" text,
	"status" "hw_status" DEFAULT 'berlangsung' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "homework_sessions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "homework_messages" ADD CONSTRAINT "homework_messages_session_id_homework_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."homework_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "homework_sessions" ADD CONSTRAINT "homework_sessions_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "homework_messages_session_idx" ON "homework_messages" USING btree ("session_id","urutan");--> statement-breakpoint
CREATE INDEX "homework_sessions_profile_idx" ON "homework_sessions" USING btree ("profile_id","created_at");--> statement-breakpoint
CREATE POLICY "homework_messages_owner" ON "homework_messages" AS PERMISSIVE FOR ALL TO "authenticated" USING (exists (select 1 from homework_sessions s where s.id = "homework_messages"."session_id" and s.profile_id = (select auth.uid()))) WITH CHECK (exists (select 1 from homework_sessions s where s.id = "homework_messages"."session_id" and s.profile_id = (select auth.uid())));--> statement-breakpoint
CREATE POLICY "homework_sessions_owner" ON "homework_sessions" AS PERMISSIVE FOR ALL TO "authenticated" USING ("homework_sessions"."profile_id" = (select auth.uid())) WITH CHECK ("homework_sessions"."profile_id" = (select auth.uid()));