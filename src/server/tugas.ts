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

/* --------------------------- Detail & pengumpulan --------------------------- */

async function keanggotaan(profile: Profile, classId: string) {
  const [g] = await db
    .select({ id: classes.id })
    .from(classes)
    .where(and(eq(classes.id, classId), eq(classes.teacherProfileId, profile.id)))
    .limit(1);
  if (g) return "guru" as const;
  const [m] = await db
    .select({ id: classMembers.id })
    .from(classMembers)
    .where(
      and(
        eq(classMembers.classId, classId),
        eq(classMembers.studentProfileId, profile.id),
      ),
    )
    .limit(1);
  return m ? ("siswa" as const) : null;
}

export interface TugasDetail {
  peran: "guru" | "siswa";
  tugas: {
    id: string;
    title: string;
    description: string | null;
    mapel: string;
    kelas: string;
    dueDate: string;
    submissionType: string;
  };
  pengumpulan: {
    status: string;
    content: string | null;
    fileUrl: string | null;
    grade: number | null;
    feedback: string | null;
  } | null;
}

/** Detail tugas + (untuk siswa) pengumpulannya. Akses: guru kelas / anggota. */
export async function getTugasDetail(
  profile: Profile,
  assignmentId: string,
): Promise<TugasDetail> {
  const [a] = await db
    .select({
      id: assignments.id,
      title: assignments.title,
      description: assignments.description,
      classId: assignments.classId,
      dueDate: assignments.dueDate,
      submissionType: assignments.submissionType,
      mapel: classes.mapel,
      kelas: classes.name,
    })
    .from(assignments)
    .innerJoin(classes, eq(assignments.classId, classes.id))
    .where(eq(assignments.id, assignmentId))
    .limit(1);
  if (!a) throw new TugasError("Tugas tidak ditemukan.", 404);

  const peran = await keanggotaan(profile, a.classId);
  if (!peran) throw new TugasError("Tidak berwenang atas tugas ini.", 403);

  let pengumpulan: TugasDetail["pengumpulan"] = null;
  if (peran === "siswa") {
    const [s] = await db
      .select({
        status: submissions.status,
        content: submissions.content,
        fileUrl: submissions.fileUrl,
        grade: submissions.grade,
        feedback: submissions.feedback,
      })
      .from(submissions)
      .where(
        and(
          eq(submissions.assignmentId, assignmentId),
          eq(submissions.studentProfileId, profile.id),
        ),
      )
      .limit(1);
    pengumpulan = s ?? null;
  }

  return {
    peran,
    tugas: {
      id: a.id,
      title: a.title,
      description: a.description,
      mapel: a.mapel,
      kelas: a.kelas,
      dueDate: a.dueDate.toISOString(),
      submissionType: a.submissionType,
    },
    pengumpulan,
  };
}

/** Mengumpulkan jawaban (siswa anggota kelas). Bisa diperbarui sebelum dinilai. */
export async function submitTugas(
  profile: Profile,
  assignmentId: string,
  input: { content?: string; fileUrl?: string },
): Promise<{ id: string }> {
  const [a] = await db
    .select({ classId: assignments.classId })
    .from(assignments)
    .where(eq(assignments.id, assignmentId))
    .limit(1);
  if (!a) throw new TugasError("Tugas tidak ditemukan.", 404);

  const peran = await keanggotaan(profile, a.classId);
  if (peran !== "siswa") {
    throw new TugasError("Hanya siswa kelas ini yang bisa mengumpulkan.", 403);
  }

  const [existing] = await db
    .select({ status: submissions.status })
    .from(submissions)
    .where(
      and(
        eq(submissions.assignmentId, assignmentId),
        eq(submissions.studentProfileId, profile.id),
      ),
    )
    .limit(1);
  if (existing?.status === "dinilai") {
    throw new TugasError("Tugas sudah dinilai, tidak bisa diubah.", 422);
  }

  const [row] = await db
    .insert(submissions)
    .values({
      assignmentId,
      studentProfileId: profile.id,
      content: input.content,
      fileUrl: input.fileUrl,
      status: "terkumpul",
      submittedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [submissions.assignmentId, submissions.studentProfileId],
      set: {
        content: input.content,
        fileUrl: input.fileUrl,
        status: "terkumpul",
        submittedAt: new Date(),
      },
    })
    .returning({ id: submissions.id });

  return { id: row.id };
}
