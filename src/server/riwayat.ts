import "server-only";

import { and, eq, isNotNull, asc } from "drizzle-orm";

import { db } from "@/db";
import { attempts, exerciseSets } from "@/db/schema";

export interface RiwayatItem {
  id: string;
  exerciseSetId: string;
  judul: string;
  mapel: string;
  nilai: number;
  benar: number | null;
  total: number | null;
  tanggal: string | null; // ISO
}

export interface RiwayatRingkas {
  totalLatihan: number;
  rataRata: number;
  nilaiTertinggi: number;
  /** Selisih rata-rata paruh akhir vs paruh awal (indikasi tren). */
  trenPersen: number;
}

export interface RiwayatStatistik {
  ringkas: RiwayatRingkas;
  perMapel: { mapel: string; rata: number; jumlah: number }[];
  /** Kronologis lama→baru (untuk grafik). */
  seri: RiwayatItem[];
  /** Terbaru dulu (untuk daftar). */
  items: RiwayatItem[];
}

function avg(nums: number[]): number {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}

/**
 * Menyusun riwayat & statistik progres latihan pengguna dari attempts yang
 * sudah selesai (score terisi), diurutkan kronologis.
 */
export async function getRiwayatStatistik(
  profileId: string,
): Promise<RiwayatStatistik> {
  const rows = await db
    .select({
      id: attempts.id,
      exerciseSetId: attempts.exerciseSetId,
      judul: exerciseSets.judul,
      mapel: exerciseSets.mapel,
      score: attempts.score,
      benar: attempts.benar,
      total: attempts.total,
      finishedAt: attempts.finishedAt,
    })
    .from(attempts)
    .innerJoin(exerciseSets, eq(attempts.exerciseSetId, exerciseSets.id))
    .where(and(eq(attempts.profileId, profileId), isNotNull(attempts.score)))
    .orderBy(asc(attempts.finishedAt));

  const seri: RiwayatItem[] = rows.map((r) => ({
    id: r.id,
    exerciseSetId: r.exerciseSetId,
    judul: r.judul,
    mapel: r.mapel,
    nilai: r.score ?? 0,
    benar: r.benar,
    total: r.total,
    tanggal: r.finishedAt ? r.finishedAt.toISOString() : null,
  }));

  const nilai = seri.map((s) => s.nilai);
  const mid = Math.floor(seri.length / 2);
  const trenPersen =
    seri.length < 2
      ? 0
      : Math.round(avg(nilai.slice(mid)) - avg(nilai.slice(0, mid)));

  const ringkas: RiwayatRingkas = {
    totalLatihan: seri.length,
    rataRata: seri.length ? Math.round(avg(nilai)) : 0,
    nilaiTertinggi: seri.length ? Math.max(...nilai) : 0,
    trenPersen,
  };

  const mapelMap = new Map<string, { sum: number; n: number }>();
  for (const s of seri) {
    const cur = mapelMap.get(s.mapel) ?? { sum: 0, n: 0 };
    cur.sum += s.nilai;
    cur.n += 1;
    mapelMap.set(s.mapel, cur);
  }
  const perMapel = [...mapelMap.entries()].map(([mapel, v]) => ({
    mapel,
    rata: Math.round(v.sum / v.n),
    jumlah: v.n,
  }));

  return { ringkas, perMapel, seri, items: [...seri].reverse() };
}
