import "server-only";

import { and, eq, desc, isNull, sql } from "drizzle-orm";

import { db } from "@/db";
import { notifications, type Notification } from "@/db/schema";

export interface DaftarNotifikasi {
  data: Notification[];
  unread: number;
}

/** Daftar notifikasi milik pengguna, terbaru dulu, beserta jumlah belum dibaca. */
export async function listNotifikasi(
  userId: string,
  limit = 20,
): Promise<DaftarNotifikasi> {
  const [data, unreadRows] = await Promise.all([
    db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(
        and(eq(notifications.userId, userId), isNull(notifications.readAt)),
      ),
  ]);

  return { data, unread: unreadRows[0]?.count ?? 0 };
}

/**
 * Menandai satu notifikasi sebagai dibaca. Dibatasi ke milik pengguna sendiri.
 * Mengembalikan `true` bila ada baris yang diperbarui.
 */
export async function tandaiDibaca(
  userId: string,
  notifId: string,
): Promise<boolean> {
  const updated = await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notifications.id, notifId),
        eq(notifications.userId, userId),
        isNull(notifications.readAt),
      ),
    )
    .returning({ id: notifications.id });

  return updated.length > 0;
}

/** Menandai semua notifikasi pengguna sebagai dibaca. Mengembalikan jumlahnya. */
export async function tandaiSemuaDibaca(userId: string): Promise<number> {
  const updated = await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(eq(notifications.userId, userId), isNull(notifications.readAt)),
    )
    .returning({ id: notifications.id });

  return updated.length;
}
