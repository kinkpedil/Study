-- Penguatan RLS Perpustakaan: buku, kategori, dan koleksi tersimpan.
--
-- Katalog (library_books, library_categories) sudah punya policy SELECT untuk
-- `authenticated` (dibuat di migrasi 0005). Di sini ditambah:
--   * hak TULIS katalog khusus admin (role 'admin' pada profiles),
--   * FORCE RLS pada saved_books agar berlaku juga untuk pemilik tabel,
--   * penolakan eksplisit untuk anon.

-- Predikat admin: pengguna login yang berperan admin.
-- (Dipakai berulang di beberapa policy.)

-- 1) Hak tulis katalog untuk admin — library_books.
create policy "library_books_admin_write" on "library_books"
  for all to "authenticated"
  using (
    exists (
      select 1 from "profiles" p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from "profiles" p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );--> statement-breakpoint

-- 2) Hak tulis katalog untuk admin — library_categories.
create policy "library_categories_admin_write" on "library_categories"
  for all to "authenticated"
  using (
    exists (
      select 1 from "profiles" p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from "profiles" p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );--> statement-breakpoint

-- 3) FORCE RLS pada koleksi tersimpan (berlaku juga untuk pemilik tabel).
alter table "saved_books" force row level security;--> statement-breakpoint

-- 4) Penolakan eksplisit untuk anon pada semua tabel perpustakaan.
create policy "library_books_no_anon" on "library_books"
  as restrictive for all to "anon" using (false);--> statement-breakpoint
create policy "library_categories_no_anon" on "library_categories"
  as restrictive for all to "anon" using (false);--> statement-breakpoint
create policy "saved_books_no_anon" on "saved_books"
  as restrictive for all to "anon" using (false);
