import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getCurrentProfile } from "@/lib/auth";
import { listThreads, createThread, ForumError } from "@/server/forum";
import { createThreadSchema } from "@/lib/validation/forum";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * GET /api/forum/threads?scope=jenjang|umum&category=
 * Daftar topik forum yang boleh diakses pengguna (berjenjang). Butuh login.
 */
export async function GET(req: NextRequest) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json(
        { error: "Tidak terautentikasi atau profil belum dibuat." },
        { status: 401 },
      );
    }

    const sp = req.nextUrl.searchParams;
    const scopeRaw = sp.get("scope");
    const scope =
      scopeRaw === "jenjang" || scopeRaw === "umum" ? scopeRaw : undefined;

    const data = await listThreads(profile, {
      scope,
      category: sp.get("category") ?? undefined,
    });
    return NextResponse.json({ data });
  } catch (err) {
    console.error("GET /api/forum/threads gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil forum." },
      { status: 500 },
    );
  }
}

/**
 * POST /api/forum/threads — buat topik baru (akses berjenjang ditegakkan).
 */
export async function POST(req: NextRequest) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json(
        { error: "Tidak terautentikasi atau profil belum dibuat." },
        { status: 401 },
      );
    }

    // Rate limit: maks 5 topik / menit per pengguna.
    const rl = await rateLimit(`forum:thread:${profile.id}`, 5, 60);
    if (!rl.allowed) return tooManyRequests(rl.retryAfter);

    const body = await req.json().catch(() => null);
    const parsed = createThreadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid.", issues: z.treeifyError(parsed.error) },
        { status: 422 },
      );
    }

    const hasil = await createThread(profile, parsed.data);
    return NextResponse.json({ data: hasil }, { status: 201 });
  } catch (err) {
    if (err instanceof ForumError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("POST /api/forum/threads gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat membuat topik." },
      { status: 500 },
    );
  }
}
