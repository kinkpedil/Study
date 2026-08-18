import "server-only";

import { and, eq, ne, desc } from "drizzle-orm";

import { db } from "@/db";
import {
  reports,
  forumThreads,
  forumPosts,
  profiles,
  type Profile,
} from "@/db/schema";

export class ModerasiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ModerasiError";
  }
}

function pastikanModerator(profile: Profile) {
  if (profile.role !== "guru" && profile.role !== "admin") {
    throw new ModerasiError("Hanya moderator (guru/admin).", 403);
  }
}

/** Melaporkan konten (topik/balasan). Pelapor = pengguna login. */
export async function laporkanKonten(
  profile: Profile,
  input: {
    targetType: "thread" | "post";
    targetId: string;
    reason:
      | "kasar"
      | "sara"
      | "perundungan"
      | "spam"
      | "doxxing"
      | "berbahaya"
      | "lainnya";
  },
): Promise<{ id: string }> {
  // Pastikan target ada.
  const ada =
    input.targetType === "thread"
      ? await db
          .select({ id: forumThreads.id })
          .from(forumThreads)
          .where(eq(forumThreads.id, input.targetId))
          .limit(1)
      : await db
          .select({ id: forumPosts.id })
          .from(forumPosts)
          .where(eq(forumPosts.id, input.targetId))
          .limit(1);
  if (ada.length === 0) {
    throw new ModerasiError("Konten yang dilaporkan tidak ditemukan.", 404);
  }

  const [row] = await db
    .insert(reports)
    .values({
      reporterProfileId: profile.id,
      targetType: input.targetType,
      targetId: input.targetId,
      reason: input.reason,
    })
    .returning({ id: reports.id });
  return { id: row.id };
}

export interface LaporanRingkas {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  status: string;
  pelapor: string;
  createdAt: string;
}

/** Antrean laporan untuk moderator (menunggu dulu, lalu riwayat). */
export async function listLaporan(
  profile: Profile,
  hanyaMenunggu = false,
): Promise<LaporanRingkas[]> {
  pastikanModerator(profile);
  const where = hanyaMenunggu ? eq(reports.status, "menunggu") : undefined;
  const rows = await db
    .select({
      id: reports.id,
      targetType: reports.targetType,
      targetId: reports.targetId,
      reason: reports.reason,
      status: reports.status,
      pelapor: profiles.fullName,
      createdAt: reports.createdAt,
    })
    .from(reports)
    .leftJoin(profiles, eq(reports.reporterProfileId, profiles.id))
    .where(where)
    .orderBy(desc(reports.createdAt))
    .limit(100);

  return rows.map((r) => ({
    id: r.id,
    targetType: r.targetType,
    targetId: r.targetId,
    reason: r.reason,
    status: r.status,
    pelapor: r.pelapor ?? "Anonim",
    createdAt: r.createdAt.toISOString(),
  }));
}

/**
 * Meninjau laporan (moderator): "hapus" menandai konten `removed` dan laporan
 * ditangani; "tolak" menandai laporan ditolak (konten tetap tampil). Laporan
 * lain untuk target yang sama ikut diselesaikan saat dihapus.
 */
export async function tinjauLaporan(
  profile: Profile,
  id: string,
  aksi: "hapus" | "tolak",
): Promise<void> {
  pastikanModerator(profile);

  const [lap] = await db
    .select()
    .from(reports)
    .where(eq(reports.id, id))
    .limit(1);
  if (!lap) throw new ModerasiError("Laporan tidak ditemukan.", 404);

  await db.transaction(async (tx) => {
    if (aksi === "hapus") {
      if (lap.targetType === "thread") {
        await tx
          .update(forumThreads)
          .set({ moderationStatus: "removed" })
          .where(eq(forumThreads.id, lap.targetId));
      } else {
        await tx
          .update(forumPosts)
          .set({ moderationStatus: "removed" })
          .where(eq(forumPosts.id, lap.targetId));
      }
      // Tuntaskan semua laporan yang masih menunggu untuk target sama.
      await tx
        .update(reports)
        .set({ status: "ditangani", handledByProfileId: profile.id })
        .where(
          and(
            eq(reports.targetType, lap.targetType),
            eq(reports.targetId, lap.targetId),
            ne(reports.status, "ditolak"),
          ),
        );
    } else {
      await tx
        .update(reports)
        .set({ status: "ditolak", handledByProfileId: profile.id })
        .where(eq(reports.id, id));
    }
  });
}
