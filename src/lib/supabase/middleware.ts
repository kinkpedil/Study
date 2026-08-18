import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Menyegarkan sesi Supabase pada setiap request dan menyediakan info pengguna
 * untuk otorisasi di middleware. Cookie sesi disalin ke response agar token
 * yang diperbarui ikut terkirim ke browser.
 *
 * Bila konfigurasi Supabase belum ada (mis. pratinjau tanpa backend),
 * mengembalikan `configured: false` agar middleware melewatkan proteksi.
 */
export interface SessionResult {
  response: NextResponse;
  configured: boolean;
  userId: string | null;
  role: string | null;
}

export async function updateSession(
  request: NextRequest,
): Promise<SessionResult> {
  const response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return { response, configured: false, userId: null, role: null };
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // getUser() memvalidasi token ke server Supabase (bukan sekadar membaca cookie).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role =
    (user?.user_metadata?.role as string | undefined) ?? null;

  return { response, configured: true, userId: user?.id ?? null, role };
}
