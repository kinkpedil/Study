CREATE TYPE "public"."audit_kategori" AS ENUM('pengguna', 'moderasi', 'forum', 'keamanan', 'sistem');--> statement-breakpoint
CREATE TYPE "public"."consent_status" AS ENUM('belum', 'menunggu', 'disetujui');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid,
	"actor_id" uuid,
	"actor_nama" text NOT NULL,
	"kategori" "audit_kategori" NOT NULL,
	"aksi" text NOT NULL,
	"target" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "data_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"izin_key" text NOT NULL,
	"aktif" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "data_permissions_profile_key_uq" UNIQUE("profile_id","izin_key")
);
--> statement-breakpoint
ALTER TABLE "data_permissions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "parental_consents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"wali_nama" text NOT NULL,
	"wali_email" text NOT NULL,
	"status" "consent_status" DEFAULT 'belum' NOT NULL,
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "parental_consents_profile_uq" UNIQUE("profile_id")
);
--> statement-breakpoint
ALTER TABLE "parental_consents" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_profiles_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_permissions" ADD CONSTRAINT "data_permissions_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parental_consents" ADD CONSTRAINT "parental_consents_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_school_idx" ON "audit_logs" USING btree ("school_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_kategori_idx" ON "audit_logs" USING btree ("kategori");--> statement-breakpoint
CREATE POLICY "audit_logs_admin_read" ON "audit_logs" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from profiles p where p.id = (select auth.uid()) and p.role = 'admin' and p.school_id = "audit_logs"."school_id"));--> statement-breakpoint
CREATE POLICY "data_permissions_owner" ON "data_permissions" AS PERMISSIVE FOR ALL TO "authenticated" USING ("data_permissions"."profile_id" = (select auth.uid())) WITH CHECK ("data_permissions"."profile_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "parental_consents_owner" ON "parental_consents" AS PERMISSIVE FOR ALL TO "authenticated" USING ("parental_consents"."profile_id" = (select auth.uid())) WITH CHECK ("parental_consents"."profile_id" = (select auth.uid()));