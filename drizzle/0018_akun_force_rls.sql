-- Penguatan RLS untuk Akun & Keamanan.
--
-- 1) FORCE ROW LEVEL SECURITY agar kebijakan berlaku bahkan bagi pemilik tabel.
ALTER TABLE "audit_logs" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "parental_consents" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "data_permissions" FORCE ROW LEVEL SECURITY;--> statement-breakpoint

-- 2) Penolakan eksplisit untuk `anon` (tanpa sesi). Data akun & data anak tidak
--    boleh terbaca tanpa autentikasi.
CREATE POLICY "audit_logs_no_anon" ON "audit_logs"
  AS RESTRICTIVE FOR ALL TO "anon" USING (false);--> statement-breakpoint
CREATE POLICY "parental_consents_no_anon" ON "parental_consents"
  AS RESTRICTIVE FOR ALL TO "anon" USING (false);--> statement-breakpoint
CREATE POLICY "data_permissions_no_anon" ON "data_permissions"
  AS RESTRICTIVE FOR ALL TO "anon" USING (false);--> statement-breakpoint

-- 3) audit_logs bersifat tak-berubah: hanya SELECT (kebijakan admin) yang ada.
--    Tolak UPDATE & DELETE secara eksplisit untuk semua peran (penulisan
--    dilakukan koneksi server yang tidak melewati kebijakan ini).
CREATE POLICY "audit_logs_no_update" ON "audit_logs"
  AS RESTRICTIVE FOR UPDATE TO "authenticated" USING (false);--> statement-breakpoint
CREATE POLICY "audit_logs_no_delete" ON "audit_logs"
  AS RESTRICTIVE FOR DELETE TO "authenticated" USING (false);
