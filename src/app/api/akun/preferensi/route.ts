import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getCurrentUserId } from "@/lib/auth";
import { preferensiSchema } from "@/lib/validation/akun";
import { getPreferensi, setPreferensi } from "@/server/akun";

export const dynamic = "force-dynamic";

/** GET /api/akun/preferensi — preferensi/izin pengguna (peta key→aktif). */
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
    }
    const data = await getPreferensi(userId);
    return NextResponse.json({ data });
  } catch (err) {
    console.error("GET /api/akun/preferensi gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memuat preferensi." },
      { status: 500 },
    );
  }
}

/** PUT /api/akun/preferensi — setel preferensi/izin. Body: { preferensi: [...] } */
export async function PUT(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
    }
    const body = await req.json().catch(() => null);
    const parsed = preferensiSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid.", issues: z.treeifyError(parsed.error) },
        { status: 422 },
      );
    }
    const data = await setPreferensi(userId, parsed.data);
    return NextResponse.json({ data });
  } catch (err) {
    console.error("PUT /api/akun/preferensi gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menyimpan preferensi." },
      { status: 500 },
    );
  }
}
