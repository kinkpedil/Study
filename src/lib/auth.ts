import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Mengembalikan id pengguna yang sedang login (sama dengan `profiles.id`),
 * atau `null` bila tidak ada sesi valid. Dipakai API/Server Action untuk
 * membatasi data ke milik pengguna.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}
