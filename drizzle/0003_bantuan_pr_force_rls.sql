-- Penguatan RLS untuk Bantuan PR.
--
-- 1) FORCE ROW LEVEL SECURITY: secara default RLS TIDAK berlaku bagi pemilik
--    tabel; FORCE membuat kebijakan tetap berlaku bahkan untuk pemilik tabel
--    (kecuali superuser / role BYPASSRLS). Ini menutup celah bila koneksi
--    memakai role pemilik tabel.
ALTER TABLE "homework_sessions" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "homework_messages" FORCE ROW LEVEL SECURITY;--> statement-breakpoint

-- 2) Kebijakan granular per operasi untuk `anon` (tanpa sesi) — tolak akses
--    eksplisit. Kebijakan `authenticated` (pemilik) sudah dibuat di migrasi
--    0002. Menambahkan penolakan eksplisit untuk anon membuat maksud jelas
--    dan aman bila default berubah.
CREATE POLICY "homework_sessions_no_anon" ON "homework_sessions"
  AS RESTRICTIVE FOR ALL TO "anon" USING (false);--> statement-breakpoint
CREATE POLICY "homework_messages_no_anon" ON "homework_messages"
  AS RESTRICTIVE FOR ALL TO "anon" USING (false);
