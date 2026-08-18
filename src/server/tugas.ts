import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { classes, assignments, type Profile } from "@/db/schema";
import type { CreateTugasInput } from "@/lib/validation/tugas";

export class TugasError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "TugasError";
  }
}

/**
 * Membuat & mengirim tugas ke kelas. Hanya guru pemilik kelas yang boleh.
 */
export async function createAssignment(
  profile: Profile,
  input: CreateTugasInput,
): Promise<{ id: string }> {
  if (profile.role !== "guru" && profile.role !== "admin") {
    throw new TugasError("Hanya guru yang dapat membuat tugas.", 403);
  }

  const [kelas] = await db
    .select({ teacherId: classes.teacherProfileId })
    .from(classes)
    .where(eq(classes.id, input.classId))
    .limit(1);
  if (!kelas) throw new TugasError("Kelas tidak ditemukan.", 404);
  if (kelas.teacherId !== profile.id && profile.role !== "admin") {
    throw new TugasError("Kamu bukan pengajar kelas ini.", 403);
  }

  const [row] = await db
    .insert(assignments)
    .values({
      authorProfileId: profile.id,
      classId: input.classId,
      title: input.title,
      description: input.description,
      dueDate: new Date(input.dueDate),
      submissionType: input.submissionType,
    })
    .returning({ id: assignments.id });

  return { id: row.id };
}
