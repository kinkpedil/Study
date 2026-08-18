import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

/**
 * Middleware otorisasi: menyegarkan sesi Supabase lalu menegakkan akses.
 *
 * - Rute publik (masuk/daftar/lupa sandi) selalu boleh diakses.
 * - Rute aplikasi butuh sesi; tanpa sesi → arahkan ke /masuk (?next=...).
 * - Rute tertentu butuh peran (admin / guru) → tanpa peran cukup → arahkan ke /.
 * - Pengguna yang sudah masuk yang membuka /masuk atau /daftar → arahkan ke /.
 *
 * Bila Supabase belum dikonfigurasi (pratinjau tanpa backend), proteksi
 * dilewati agar UI berbasis data tiruan tetap dapat dijelajahi.
 */

const rutePublik = ["/masuk", "/daftar", "/lupa-sandi"];
const ruteAdmin = ["/akun/aktivitas", "/forum/kelola", "/forum/moderasi"];
const ruteGuruAdmin = ["/tutor/eskalasi"];

function cocok(pathname: string, daftar: string[]): boolean {
  return daftar.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}

export async function middleware(request: NextRequest) {
  const { response, configured, userId, role } = await updateSession(request);

  // Tanpa backend Supabase: lewati proteksi (mode pratinjau).
  if (!configured) return response;

  const { pathname } = request.nextUrl;
  const publik = cocok(pathname, rutePublik);

  // Sudah masuk namun membuka halaman auth → ke Beranda.
  if (userId && publik) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Butuh sesi untuk rute non-publik.
  if (!userId && !publik) {
    const url = new URL("/masuk", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Otorisasi peran.
  if (userId && cocok(pathname, ruteAdmin) && role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (
    userId &&
    cocok(pathname, ruteGuruAdmin) &&
    role !== "guru" &&
    role !== "admin"
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  /**
   * Jalankan pada semua rute kecuali aset statis & internal Next. API auth
   * tetap dilewati matcher agar tidak memblokir alur masuk/daftar.
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
