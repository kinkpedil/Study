import "server-only";

import { and, eq, gte, lt, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  assignments,
  classes,
  classMembers,
  submissions,
  notifications,
} from "@/db/schema";

/**
 * Layanan pengingat tugas: membuat notifikasi untuk siswa yang belum
 * mengumpulkan tugas yang (a) mendekati tenggat, atau (b) sudah terlambat.
 * Idempoten: satu notifikasi per (siswa, tugas, jenis) berkat pengecekan
 * keberadaan sebelum insert. Cocok dipanggil terjadwal (cron).
 */

interface HasilPengingat {
  pengingat: number;
  terlambat: number;
}

/** Siswa anggota kelas yang BELUM mengumpulkan tugas tertentu. */
async function siswaBelumMengumpulkan(assignmentId: string, classId: string) {
  return db
    .select({ studentId: classMembers.studentProfileId })
    .from(classMembers)
    .where(
      and(
        eq(classMembers.classId, classId),
        sql`not exists (
          select 1 from ${submissions} s
          where s.assignment_id = ${assignmentId}
            and s.student_profile_id = ${classMembers.studentProfileId}
        )`,
      ),
    );
}

/** Insert notifikasi bila belum ada untuk (user, link, prefix jenis). */
async function kirimSekali(
  userId: string,
  link: string,
  prefix: string,
  title: string,
  message: string,
) {
  const ada = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.link, link),
        sql`${notifications.message} like ${prefix + "%"}`,
      ),
    )
    .limit(1);
  if (ada.length > 0) return false;

  await db.insert(notifications).values({
    userId,
    type: "tugas",
    title,
    message,
    link,
  });
  return true;
}

/**
 * Menjalankan pemindaian pengingat & keterlambatan.
 * @param windowJam rentang jam ke depan untuk pengingat tenggat (default 24).
 */
export async function jalankanPengingatTugas(
  windowJam = 24,
): Promise<HasilPengingat> {
  const now = new Date();
  const batas = new Date(now.getTime() + windowJam * 3600 * 1000);
  const hasil: HasilPengingat = { pengingat: 0, terlambat: 0 };

  // (a) Mendekati tenggat: due antara sekarang dan batas.
  const akanTenggat = await db
    .select({
      id: assignments.id,
      classId: assignments.classId,
      title: assignments.title,
      dueDate: assignments.dueDate,
    })
    .from(assignments)
    .where(and(gte(assignments.dueDate, now), lt(assignments.dueDate, batas)));

  for (const a of akanTenggat) {
    const siswa = await siswaBelumMengumpulkan(a.id, a.classId);
    for (const s of siswa) {
      const dibuat = await kirimSekali(
        s.studentId,
        `/tugas/${a.id}`,
        "Pengingat:",
        "Tenggat tugas mendekat",
        `Pengingat: “${a.title}” tenggat ${a.dueDate.toLocaleString("id-ID")}.`,
      );
      if (dibuat) hasil.pengingat += 1;
    }
  }

  // (b) Terlambat: due sudah lewat.
  const terlambat = await db
    .select({
      id: assignments.id,
      classId: assignments.classId,
      title: assignments.title,
    })
    .from(assignments)
    .innerJoin(classes, eq(assignments.classId, classes.id))
    .where(lt(assignments.dueDate, now));

  for (const a of terlambat) {
    const siswa = await siswaBelumMengumpulkan(a.id, a.classId);
    for (const s of siswa) {
      const dibuat = await kirimSekali(
        s.studentId,
        `/tugas/${a.id}`,
        "Terlambat:",
        "Tugas terlambat",
        `Terlambat: “${a.title}” sudah melewati tenggat dan belum dikumpulkan.`,
      );
      if (dibuat) hasil.terlambat += 1;
    }
  }

  return hasil;
}
