-- Penguatan RLS untuk Tutor AI Pribadi.
--
-- 1) FORCE ROW LEVEL SECURITY: membuat kebijakan tetap berlaku bahkan bagi
--    pemilik tabel (kecuali superuser / role BYPASSRLS), menutup celah bila
--    koneksi memakai role pemilik tabel.
ALTER TABLE "tutor_sessions" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "tutor_messages" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "tutor_escalations" FORCE ROW LEVEL SECURITY;--> statement-breakpoint

-- 2) Penolakan eksplisit untuk `anon` (tanpa sesi). Data tutor adalah data
--    anak — pastikan tidak pernah terbaca tanpa autentikasi, apa pun default
--    yang berlaku di masa depan.
CREATE POLICY "tutor_sessions_no_anon" ON "tutor_sessions"
  AS RESTRICTIVE FOR ALL TO "anon" USING (false);--> statement-breakpoint
CREATE POLICY "tutor_messages_no_anon" ON "tutor_messages"
  AS RESTRICTIVE FOR ALL TO "anon" USING (false);--> statement-breakpoint
CREATE POLICY "tutor_escalations_no_anon" ON "tutor_escalations"
  AS RESTRICTIVE FOR ALL TO "anon" USING (false);
