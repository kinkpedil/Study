import "server-only";

import { and, eq, asc, desc, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  classes,
  classMembers,
  assignments,
  submissions,
  type Profile,
} from "@/db/schema";
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

export interface TugasSiswaItem {
  id: string;
  title: string;
  mapel: string;
  dueDate: string;
  submissionType: string;
  status: "belum" | "terlambat" | "terkumpul" | "dinilai";
  grade: number | null;
}

/** Daftar tugas untuk siswa (kelas yang diikuti) + status pengumpulannya. */
export async function listTugasSiswa(
  profile: Profile,
): Promise<TugasSiswaItem[]> {
  const rows = await db
    .select({
      id: assignments.id,
      title: assignments.title,
      mapel: classes.mapel,
      dueDate: assignments.dueDate,
      submissionType: assignments.submissionType,
      subStatus: submissions.status,
      grade: submissions.grade,
    })
    .from(assignments)
    .innerJoin(classes, eq(assignments.classId, classes.id))
    .innerJoin(
      classMembers,
      and(
        eq(classMembers.classId, assignments.classId),
        eq(classMembers.studentProfileId, profile.id),
      ),
    )
    .leftJoin(
      submissions,
      and(
        eq(submissions.assignmentId, assignments.id),
        eq(submissions.studentProfileId, profile.id),
      ),
    )
    .orderBy(asc(assignments.dueDate));

  const now = Date.now();
  return rows.map((r) => {
    let status: TugasSiswaItem["status"];
    if (r.subStatus === "dinilai") status = "dinilai";
    else if (r.subStatus === "terkumpul") status = "terkumpul";
    else status = r.dueDate.getTime() < now ? "terlambat" : "belum";
    return {
      id: r.id,
      title: r.title,
      mapel: r.mapel,
      dueDate: r.dueDate.toISOString(),
      submissionType: r.submissionType,
      status,
      grade: r.grade,
    };
  });
}

export interface TugasGuruItem {
  id: string;
  title: string;
  mapel: string;
  kelas: string;
  dueDate: string;
  jumlahSiswa: number;
  terkumpul: number;
  perluDinilai: number;
}

/** Daftar tugas yang dibuat guru + ringkasan progres pengumpulan. */
export async function listTugasGuru(
  profile: Profile,
): Promise<TugasGuruItem[]> {
  const rows = await db
    .select({
      id: assignments.id,
      title: assignments.title,
      mapel: classes.mapel,
      kelas: classes.name,
      dueDate: assignments.dueDate,
      jumlahSiswa: sql<number>`(
        select count(*)::int from ${classMembers} cm where cm.class_id = ${assignments.classId}
      )`,
      terkumpul: sql<number>`(
        select count(*)::int from ${submissions} s where s.assignment_id = ${assignments.id}
      )`,
      perluDinilai: sql<number>`(
        select count(*)::int from ${submissions} s
        where s.assignment_id = ${assignments.id} and s.status = 'terkumpul'
      )`,
    })
    .from(assignments)
    .innerJoin(classes, eq(assignments.classId, classes.id))
    .where(eq(classes.teacherProfileId, profile.id))
    .orderBy(desc(assignments.dueDate));

  return rows.map((r) => ({ ...r, dueDate: r.dueDate.toISOString() }));
}
