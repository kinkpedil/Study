import "server-only";

import { eq, desc } from "drizzle-orm";

import { db } from "@/db";
import {
  schools,
  schoolForums,
  announcements,
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
