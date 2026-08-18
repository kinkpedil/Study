import "server-only";

import { and, eq, desc, or } from "drizzle-orm";

import { db } from "@/db";
import {
  schools,
  schoolForums,
  announcements,
  complaints,
  profiles,
  type Profile,
} from "@/db/schema";

export class ForumSekolahError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ForumSekolahError";
  }
}

export interface ForumSekolahData {
  forum: { id: string; name: string; description: string | null } | null;
  pengumuman: {
    id: string;
    title: string;
    body: string;
    penulis: string;
    createdAt: string;
  }[];
}

/** Forum sekolah pengguna (berdasarkan school_id profil) + pengumumannya. */
export async function getForumSekolah(
  profile: Profile,
): Promise<ForumSekolahData> {
  if (!profile.schoolId) return { forum: null, pengumuman: [] };

  const [forum] = await db
    .select()
    .from(schoolForums)
    .where(eq(schoolForums.schoolId, profile.schoolId))
    .orderBy(schoolForums.createdAt)
    .limit(1);

  if (!forum) return { forum: null, pengumuman: [] };

  const rows = await db
    .select({
      id: announcements.id,
      title: announcements.title,
      body: announcements.body,
      penulis: profiles.fullName,
      createdAt: announcements.createdAt,
    })
    .from(announcements)
    .leftJoin(profiles, eq(announcements.createdByProfileId, profiles.id))
    .where(eq(announcements.schoolForumId, forum.id))
    .orderBy(desc(announcements.createdAt));

  return {
    forum: { id: forum.id, name: forum.name, description: forum.description },
    pengumuman: rows.map((r) => ({
      id: r.id,
      title: r.title,
      body: r.body,
      penulis: r.penulis ?? "Admin sekolah",
      createdAt: r.createdAt.toISOString(),
    })),
  };
}

/** Memastikan sekolah punya satu ruang forum; membuat default bila belum ada. */
async function pastikanForum(profile: Profile): Promise<string> {
  const [ada] = await db
    .select({ id: schoolForums.id })
    .from(schoolForums)
    .where(eq(schoolForums.schoolId, profile.schoolId!))
    .limit(1);
  if (ada) return ada.id;

  const [sekolah] = await db
    .select({ name: schools.name })
    .from(schools)
    .where(eq(schools.id, profile.schoolId!))
    .limit(1);

  const [row] = await db
    .insert(schoolForums)
    .values({
      schoolId: profile.schoolId!,
      name: `Forum ${sekolah?.name ?? "Sekolah"}`,
      createdByProfileId: profile.id,
    })
    .returning({ id: schoolForums.id });
  return row.id;
}

/** Membuat pengumuman (admin sekolah saja). */
export async function buatPengumuman(
  profile: Profile,
  input: { title: string; body: string },
): Promise<{ id: string }> {
  if (profile.role !== "admin") {
    throw new ForumSekolahError("Hanya admin sekolah yang dapat membuat pengumuman.", 403);
  }
  if (!profile.schoolId) {
    throw new ForumSekolahError("Admin tidak terhubung ke sekolah.", 400);
  }

  const forumId = await pastikanForum(profile);
  const [row] = await db
    .insert(announcements)
    .values({
      schoolForumId: forumId,
      title: input.title,
      body: input.body,
      createdByProfileId: profile.id,
    })
    .returning({ id: announcements.id });

  return { id: row.id };
}

/* ---------------------------- Pengajuan masalah ---------------------------- */

export interface PengaduanRingkas {
  id: string;
  title: string;
  description: string;
  visibility: string;
  status: string;
  resolutionNote: string | null;
  pelapor: string;
  createdAt: string;
}

/**
 * Daftar pengaduan yang boleh dilihat pengguna di forum sekolahnya:
 * miliknya sendiri, yang publik, atau semua bila admin.
 */
export async function listPengaduan(
  profile: Profile,
): Promise<PengaduanRingkas[]> {
  if (!profile.schoolId) return [];
  const [forum] = await db
    .select({ id: schoolForums.id })
    .from(schoolForums)
    .where(eq(schoolForums.schoolId, profile.schoolId))
    .limit(1);
  if (!forum) return [];

  const visibilitas =
    profile.role === "admin"
      ? undefined
      : or(
          eq(complaints.studentProfileId, profile.id),
          eq(complaints.visibility, "publik"),
        );

  const where = visibilitas
    ? and(eq(complaints.schoolForumId, forum.id), visibilitas)
    : eq(complaints.schoolForumId, forum.id);

  const rows = await db
    .select({
      id: complaints.id,
      title: complaints.title,
      description: complaints.description,
      visibility: complaints.visibility,
      status: complaints.status,
      resolutionNote: complaints.resolutionNote,
      pelapor: profiles.fullName,
      createdAt: complaints.createdAt,
    })
    .from(complaints)
    .leftJoin(profiles, eq(complaints.studentProfileId, profiles.id))
    .where(where)
    .orderBy(desc(complaints.createdAt));

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    visibility: r.visibility,
    status: r.status,
    resolutionNote: r.resolutionNote,
    pelapor: r.pelapor ?? "Anonim",
    createdAt: r.createdAt.toISOString(),
  }));
}

/** Mengajukan masalah baru (pelapor = pengguna login). */
export async function buatPengaduan(
  profile: Profile,
  input: {
    title: string;
    description: string;
    visibility: "privat" | "publik";
  },
): Promise<{ id: string }> {
  if (!profile.schoolId) {
    throw new ForumSekolahError("Pengguna tidak terhubung ke sekolah.", 400);
  }
  const forumId = await pastikanForum(profile);
  const [row] = await db
    .insert(complaints)
    .values({
      schoolForumId: forumId,
      studentProfileId: profile.id,
      title: input.title,
      description: input.description,
      visibility: input.visibility,
    })
    .returning({ id: complaints.id });
  return { id: row.id };
}

/** Memperbarui status/tindak lanjut pengaduan (admin sekolah). */
export async function ubahStatusPengaduan(
  profile: Profile,
  id: string,
  input: {
    status: "baru" | "diproses" | "selesai";
    resolutionNote?: string;
  },
): Promise<void> {
  if (profile.role !== "admin") {
    throw new ForumSekolahError("Hanya admin sekolah yang dapat menindaklanjuti.", 403);
  }

  // Pastikan pengaduan berada di sekolah admin.
  const [row] = await db
    .select({ schoolId: schoolForums.schoolId })
    .from(complaints)
    .innerJoin(schoolForums, eq(complaints.schoolForumId, schoolForums.id))
    .where(eq(complaints.id, id))
    .limit(1);
  if (!row) throw new ForumSekolahError("Pengaduan tidak ditemukan.", 404);
  if (row.schoolId !== profile.schoolId) {
    throw new ForumSekolahError("Pengaduan bukan dari sekolahmu.", 403);
  }

  await db
    .update(complaints)
    .set({
      status: input.status,
      resolutionNote: input.resolutionNote,
      handledByProfileId: profile.id,
    })
    .where(eq(complaints.id, id));
}
