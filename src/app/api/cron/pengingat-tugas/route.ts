import { NextResponse, type NextRequest } from "next/server";

import { jalankanPengingatTugas } from "@/server/pengingat";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST/GET /api/cron/pengingat-tugas — dijalankan terjadwal (Vercel Cron).
 * Dilindungi CRON_SECRET via header Authorization: Bearer <secret>.
 */
async function handle(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Tidak berwenang." }, { status: 401 });
  }

  try {
    const hasil = await jalankanPengingatTugas();
    return NextResponse.json({ data: hasil });
  } catch (err) {
    console.error("Cron pengingat-tugas gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menjalankan pengingat." },
      { status: 500 },
    );
  }
}

export const GET = handle;
export const POST = handle;
