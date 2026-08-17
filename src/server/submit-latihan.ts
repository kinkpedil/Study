import "server-only";

import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  exerciseSets,
  questions,
  attempts,
  answers,
  learningProgress,
} from "@/db/schema";
import type { SubmitLatihanInput } from "@/lib/validation/latihan";

export class SubmitError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "SubmitError";
  }
}

export interface HasilSubmit {
  attemptId: string;
  score: number;
  benar: number;
  totalPG: number;
  totalEsai: number;
}

/**
 * Menerima jawaban, menilai bagian pilihan ganda, menyimpan attempt + answers,
 * dan memperbarui progres belajar per mapel. Esai tidak dinilai otomatis.
 *
 * Catatan: koneksi Drizzle memakai peran `postgres` yang melewati RLS, sehingga
 * kepemilikan/akses divalidasi manual di sini.
 */
export async function submitLatihan(
  input: SubmitLatihanInput,
  profileId: string,
): Promise<HasilSubmit> {
  // 1. Pastikan paket ada & boleh diakses pengguna (pemilik atau publik).
  const [set] = await db
    .select({
      id: exerciseSets.id,
      authorProfileId: exerciseSets.authorProfileId,
      isPublic: exerciseSets.isPublic,
      mapel: exerciseSets.mapel,
    })
    .from(exerciseSets)
    .where(eq(exerciseSets.id, input.exerciseSetId))
    .limit(1);

  if (!set) throw new SubmitError("Paket latihan tidak ditemukan.", 404);
  if (set.authorProfileId !== profileId && !set.isPublic) {
    throw new SubmitError("Tidak berwenang atas paket latihan ini.", 403);
  }

  // 2. Ambil soal beserta kunci untuk penilaian.
  const soal = await db
    .select({
      id: questions.id,
      tipe: questions.tipe,
      kunci: questions.kunci,
    })
    .from(questions)
    .where(eq(questions.exerciseSetId, set.id));

  const soalById = new Map(soal.map((s) => [s.id, s]));

  // 3. Nilai jawaban (hanya jawaban untuk soal pada paket ini yang dihitung).
  let benar = 0;
  let totalPG = 0;
  let totalEsai = 0;

  const rows = input.jawaban
    .filter((j) => soalById.has(j.questionId))
    .map((j) => {
      const s = soalById.get(j.questionId)!;
      let isBenar: boolean | null = null;
      if (s.tipe === "pilihan_ganda") {
        totalPG += 1;
        isBenar = j.jawaban.trim() === s.kunci.trim();
        if (isBenar) benar += 1;
      } else {
        totalEsai += 1;
      }
      return { questionId: j.questionId, jawaban: j.jawaban, benar: isBenar };
    });

  if (rows.length === 0) {
    throw new SubmitError("Tidak ada jawaban valid untuk paket ini.", 422);
  }

  const score = totalPG === 0 ? 0 : Math.round((benar / totalPG) * 100);

  // 4. Simpan attempt + answers, lalu perbarui progres — dalam satu transaksi.
  const attemptId = await db.transaction(async (tx) => {
    const [attempt] = await tx
      .insert(attempts)
      .values({
        exerciseSetId: set.id,
        profileId,
        score,
        benar,
        total: totalPG,
        finishedAt: new Date(),
      })
      .returning({ id: attempts.id });

    await tx
      .insert(answers)
      .values(rows.map((r) => ({ attemptId: attempt.id, ...r })));

    // Upsert progres per mapel: tambah jumlah soal, campur rata-rata & mastery.
    await tx
      .insert(learningProgress)
      .values({
        profileId,
        mapel: set.mapel,
        masteryPercent: score,
        soalDikerjakan: totalPG,
        rataRataNilai: totalPG > 0 ? score : null,
      })
      .onConflictDoUpdate({
        target: [learningProgress.profileId, learningProgress.mapel],
        set: {
          soalDikerjakan: sql`${learningProgress.soalDikerjakan} + ${totalPG}`,
          // Rata-rata bergerak sederhana; null diperlakukan sebagai skor kini.
          rataRataNilai: sql`round((coalesce(${learningProgress.rataRataNilai}, ${score}) + ${score}) / 2.0)`,
          masteryPercent: score,
          updatedAt: new Date(),
        },
      });

    return attempt.id;
  });

  return { attemptId, score, benar, totalPG, totalEsai };
}
