CREATE TYPE "public"."jenjang" AS ENUM('SD', 'SMP', 'SMA');--> statement-breakpoint
CREATE TYPE "public"."notif_type" AS ENUM('tugas', 'forum', 'pengumuman', 'nilai', 'sistem');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('siswa', 'guru', 'admin');--> statement-breakpoint
CREATE TABLE "schools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"npsn" text,
	"address" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"school_id" uuid,
	"full_name" text NOT NULL,
	"role" "role" DEFAULT 'siswa' NOT NULL,
	"jenjang" "jenjang",
	"kelas" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "notif_type" DEFAULT 'sistem' NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"link" text,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"mapel" text NOT NULL,
	"mastery_percent" integer DEFAULT 0 NOT NULL,
	"soal_dikerjakan" integer DEFAULT 0 NOT NULL,
	"rata_rata_nilai" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "learning_progress_profile_mapel_uq" UNIQUE("profile_id","mapel")
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_progress" ADD CONSTRAINT "learning_progress_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notifications_user_created_idx" ON "notifications" USING btree ("user_id","created_at");