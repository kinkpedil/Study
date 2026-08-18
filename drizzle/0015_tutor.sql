CREATE TYPE "public"."tutor_eskalasi_status" AS ENUM('baru', 'ditangani');--> statement-breakpoint
CREATE TYPE "public"."tutor_risk" AS ENUM('keselamatan_diri', 'kekerasan', 'konten_dewasa', 'perundungan', 'data_pribadi');--> statement-breakpoint
CREATE TYPE "public"."tutor_sender" AS ENUM('siswa', 'ai');--> statement-breakpoint
CREATE TYPE "public"."tutor_status" AS ENUM('berlangsung', 'selesai');--> statement-breakpoint
CREATE TABLE "tutor_escalations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"siswa_id" uuid NOT NULL,
	"school_id" uuid,
	"guru_id" uuid,
	"judul" text NOT NULL,
	"mapel" text NOT NULL,
	"jenjang" "jenjang",
	"catatan" text,
	"status" "tutor_eskalasi_status" DEFAULT 'baru' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tutor_escalations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tutor_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"sender" "tutor_sender" NOT NULL,
	"content" text NOT NULL,
	"urutan" integer DEFAULT 0 NOT NULL,
	"flagged" boolean DEFAULT false NOT NULL,
	"risk_kategori" "tutor_risk",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tutor_messages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tutor_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"judul" text NOT NULL,
	"mapel" text NOT NULL,
	"jenjang" "jenjang",
	"status" "tutor_status" DEFAULT 'berlangsung' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tutor_sessions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "tutor_escalations" ADD CONSTRAINT "tutor_escalations_session_id_tutor_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."tutor_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutor_escalations" ADD CONSTRAINT "tutor_escalations_siswa_id_profiles_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutor_escalations" ADD CONSTRAINT "tutor_escalations_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutor_escalations" ADD CONSTRAINT "tutor_escalations_guru_id_profiles_id_fk" FOREIGN KEY ("guru_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutor_messages" ADD CONSTRAINT "tutor_messages_session_id_tutor_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."tutor_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutor_sessions" ADD CONSTRAINT "tutor_sessions_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tutor_escalations_school_idx" ON "tutor_escalations" USING btree ("school_id","status","created_at");--> statement-breakpoint
CREATE INDEX "tutor_escalations_siswa_idx" ON "tutor_escalations" USING btree ("siswa_id","created_at");--> statement-breakpoint
CREATE INDEX "tutor_messages_session_idx" ON "tutor_messages" USING btree ("session_id","urutan");--> statement-breakpoint
CREATE INDEX "tutor_sessions_profile_idx" ON "tutor_sessions" USING btree ("profile_id","created_at");--> statement-breakpoint
CREATE POLICY "tutor_escalations_siswa_owner" ON "tutor_escalations" AS PERMISSIVE FOR ALL TO "authenticated" USING ("tutor_escalations"."siswa_id" = (select auth.uid())) WITH CHECK ("tutor_escalations"."siswa_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "tutor_escalations_guru_read" ON "tutor_escalations" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from profiles p where p.id = (select auth.uid()) and p.role in ('guru','admin') and p.school_id = "tutor_escalations"."school_id"));--> statement-breakpoint
CREATE POLICY "tutor_escalations_guru_update" ON "tutor_escalations" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles p where p.id = (select auth.uid()) and p.role in ('guru','admin') and p.school_id = "tutor_escalations"."school_id")) WITH CHECK (exists (select 1 from profiles p where p.id = (select auth.uid()) and p.role in ('guru','admin') and p.school_id = "tutor_escalations"."school_id"));--> statement-breakpoint
CREATE POLICY "tutor_messages_owner" ON "tutor_messages" AS PERMISSIVE FOR ALL TO "authenticated" USING (exists (select 1 from tutor_sessions s where s.id = "tutor_messages"."session_id" and s.profile_id = (select auth.uid()))) WITH CHECK (exists (select 1 from tutor_sessions s where s.id = "tutor_messages"."session_id" and s.profile_id = (select auth.uid())));--> statement-breakpoint
CREATE POLICY "tutor_sessions_owner" ON "tutor_sessions" AS PERMISSIVE FOR ALL TO "authenticated" USING ("tutor_sessions"."profile_id" = (select auth.uid())) WITH CHECK ("tutor_sessions"."profile_id" = (select auth.uid()));