CREATE TYPE "public"."report_reason" AS ENUM('kasar', 'sara', 'perundungan', 'spam', 'doxxing', 'berbahaya', 'lainnya');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('menunggu', 'ditangani', 'ditolak');--> statement-breakpoint
CREATE TYPE "public"."report_target_type" AS ENUM('thread', 'post');--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reporter_profile_id" uuid NOT NULL,
	"target_type" "report_target_type" NOT NULL,
	"target_id" uuid NOT NULL,
	"reason" "report_reason" NOT NULL,
	"status" "report_status" DEFAULT 'menunggu' NOT NULL,
	"handled_by_profile_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reports" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_profile_id_profiles_id_fk" FOREIGN KEY ("reporter_profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_handled_by_profile_id_profiles_id_fk" FOREIGN KEY ("handled_by_profile_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "reports_status_idx" ON "reports" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "reports_target_idx" ON "reports" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE POLICY "reports_select" ON "reports" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("reports"."reporter_profile_id" = (select auth.uid()) or exists (
  select 1 from profiles p where p.id = (select auth.uid()) and p.role in ('guru','admin')
));--> statement-breakpoint
CREATE POLICY "reports_insert" ON "reports" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("reports"."reporter_profile_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "reports_update" ON "reports" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (
  select 1 from profiles p where p.id = (select auth.uid()) and p.role in ('guru','admin')
)) WITH CHECK (exists (
  select 1 from profiles p where p.id = (select auth.uid()) and p.role in ('guru','admin')
));