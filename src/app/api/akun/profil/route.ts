import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getCurrentUserId } from "@/lib/auth";
import { updateProfilSchema } from "@/lib/validation/akun";
import { getProfil, updateProfil, AkunError } from "@/server/akun";

export const dynamic = "force-dynamic";

/** GET /api/akun/profil — profil pengguna login. */
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
    }
    const data = await getProfil(userId);
    return NextResponse.json({ data });
  } catch (err) {
    if (err instanceof AkunError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("GET /api/akun/profil gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memuat profil." },
      { status: 500 },
    );
  }
}

/** PATCH /api/akun/profil — ubah nama & kelas (siswa). Body: { nama?, kelas? } */
export async function PATCH(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
    }
    const body = await req.json().catch(() => null);
    const parsed = updateProfilSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid.", issues: z.treeifyError(parsed.error) },
        { status: 422 },
      );
    }
    const data = await updateProfil(userId, parsed.data);
    return NextResponse.json({ data });
  } catch (err) {
    if (err instanceof AkunError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("PATCH /api/akun/profil gagal:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memperbarui profil." },
      { status: 500 },
    );
  }
}
