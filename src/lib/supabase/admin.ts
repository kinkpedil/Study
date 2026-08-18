import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Klien Supabase dengan service-role key untuk operasi administratif yang
 * melewati RLS (mis. menghapus pengguna auth). HANYA dipakai di server; key
 * tidak pernah dikirim ke browser. Melempar bila konfigurasi kurang.
 */
export function createSupabaseAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Konfigurasi admin Supabase belum lengkap (NEXT_PUBLIC_SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY). Lihat .env.example.",
    );
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
