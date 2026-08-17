import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Klien Supabase untuk server (Route Handler / Server Component / Server
 * Action). Sesi dibaca & ditulis lewat cookie milik request. API key hanya
 * dipakai di server; anon key aman untuk digunakan dengan RLS.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Konfigurasi Supabase belum lengkap. Lihat .env.example (NEXT_PUBLIC_SUPABASE_URL & NEXT_PUBLIC_SUPABASE_ANON_KEY).",
    );
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Dipanggil dari Server Component — pengaturan cookie diabaikan;
          // penyegaran sesi ditangani oleh middleware.
        }
      },
    },
  });
}
