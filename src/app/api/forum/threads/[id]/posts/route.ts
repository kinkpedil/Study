import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getCurrentProfile } from "@/lib/auth";
import { createPost, ForumError } from "@/server/forum";
import { createPostSchema } from "@/lib/validation/forum";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * POST /api/forum/threads/:id/posts — balas topik (akses berjenjang ditegakkan).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json(
        { error: "Tidak terautentikasi atau profil belum dibuat." },
        { status: 401 },
      );
    }
    // Rate limit: maks 15 balasan / menit per pengguna.
    const rl = await rateLimit(`forum:post:${profile.id}`, 15, 60);
    if (!rl.allowed) return tooManyRequests(rl.retryAfter);

    const { id } = await params;
    const body = await req.json().catch(() => null);
    const parsed = createPostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid.", issues: z.treeifyError(parsed.error) },
        { status: 422 },
      );
    }

    const hasil = await createPost(profile, id, parsed.data);
    return NextResponse.json({ data: hasil }, { status: 201 });
  } catch (err) {
    if (err instanceof ForumError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("POST /api/forum/threads/:id/posts gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat membalas." },
      { status: 500 },
    );
  }
}
