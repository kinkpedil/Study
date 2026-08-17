import "server-only";

import { eq, asc } from "drizzle-orm";

import { db } from "@/db";
import { learningProgress } from "@/db/schema";

export interface PenguasaanMapel {
  mapel: string;
  masteryPercent: number;
  soalDikerjakan: number;
  rataRataNilai: number | null;
}

export interface RingkasanProgres {
  totalSoal: number;
  jumlahMapel: number;
  rataRataNilai: number | null;
  rataRataPenguasaan: number;
  penguasaanMapel: PenguasaanMapel[];
}

/**
 * Menghitung ringkasan progres seorang pengguna dari tabel learning_progress:
 * total soal dikerjakan, rata-rata nilai & penguasaan, serta rincian per mapel.
 */
export async function getRingkasanProgres(
  profileId: string,
): Promise<RingkasanProgres> {
  const rows = await db
    .select({
      mapel: learningProgress.mapel,
      masteryPercent: learningProgress.masteryPercent,
      soalDikerjakan: learningProgress.soalDikerjakan,
      rataRataNilai: learningProgress.rataRataNilai,
    })
    .from(learningProgress)
    .where(eq(learningProgress.profileId, profileId))
    .orderBy(asc(learningProgress.mapel));

  const totalSoal = rows.reduce((a, r) => a + r.soalDikerjakan, 0);

  const nilaiTerisi = rows.filter((r) => r.rataRataNilai !== null);
  const rataRataNilai =
    nilaiTerisi.length === 0
      ? null
      : Math.round(
          nilaiTerisi.reduce((a, r) => a + (r.rataRataNilai ?? 0), 0) /
            nilaiTerisi.length,
        );

  const rataRataPenguasaan =
    rows.length === 0
      ? 0
      : Math.round(
          rows.reduce((a, r) => a + r.masteryPercent, 0) / rows.length,
        );

  return {
    totalSoal,
    jumlahMapel: rows.length,
    rataRataNilai,
    rataRataPenguasaan,
    penguasaanMapel: rows,
  };
}
