import "server-only";

import { eq } from "drizzle-orm";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { profiles, type Profile } from "@/db/schema";

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

/**
 * Mengambil profil (termasuk `role`, `jenjang`, `schoolId`) pengguna yang
 * sedang login, atau `null` bila belum login / profil belum dibuat. Menjadi
 * dasar penyaringan data per peran.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const rows = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  return rows[0] ?? null;
}
