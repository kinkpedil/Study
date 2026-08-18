import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getCurrentUserId } from "@/lib/auth";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { buatEskalasi, EskalasiError } from "@/server/eskalasi-tutor";

export const dynamic = "force-dynamic";

const eskalasiSchema = z.object({
  catatan: z.string().trim().max(1000).optional(),
  guruId: z.string().uuid().optional(),
});

/**
 * POST /api/tutor/:sessionId/eskalasi
 * Siswa meneruskan sesi tutornya ke guru; guru sekolah menerima notifikasi.
 * Body: { catatan?, guruId? }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Tidak terautentikasi." },
        { status: 401 },
      );
    }

    const rl = await rateLimit(`tutor:eskalasi:${userId}`, 10, 3600);
    if (!rl.allowed) return tooManyRequests(rl.retryAfter);

    const { sessionId } = await params;
    const body = await req.json().catch(() => ({}));
    const parsed = eskalasiSchema.safeParse(body ?? {});
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid.", issues: z.treeifyError(parsed.error) },
        { status: 422 },
      );
    }

    const data = await buatEskalasi(
      sessionId,
      userId,
      parsed.data.catatan,
      parsed.data.guruId,
    );
    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    if (err instanceof EskalasiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("POST /api/tutor/:id/eskalasi gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat meneruskan ke guru." },
      { status: 500 },
    );
  }
}
