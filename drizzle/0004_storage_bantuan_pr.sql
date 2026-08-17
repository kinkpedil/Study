-- Penyimpanan foto soal Bantuan PR di Supabase Storage.
--
-- Bucket privat `bantuan-pr`. File disimpan sebagai `{auth.uid}/{uuid}.{ext}`
-- sehingga folder tingkat pertama = id pemilik. RLS storage.objects membatasi
-- akses ke pemilik folder saja.

-- 1) Buat bucket privat (idempoten).
insert into storage.buckets (id, name, public)
values ('bantuan-pr', 'bantuan-pr', false)
on conflict (id) do nothing;--> statement-breakpoint

-- 2) RLS storage.objects khusus bucket ini — pemilik = folder tingkat pertama.
create policy "bantuan_pr_foto_select" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'bantuan-pr'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );--> statement-breakpoint

create policy "bantuan_pr_foto_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'bantuan-pr'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );--> statement-breakpoint

create policy "bantuan_pr_foto_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'bantuan-pr'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
