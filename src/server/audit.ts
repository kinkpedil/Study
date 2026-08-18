import "server-only";

import { and, eq, desc } from "drizzle-orm";

import { db } from "@/db";
import { auditLogs, type Profile } from "@/db/schema";

/**
 * Catatan aktivitas (audit log). `catatAudit` dipanggil dari aksi penting untuk
 * mencatat jejak (tak-berubah). `listAudit` menyediakan antrean untuk admin,
 * di-scope ke sekolahnya (cek peran & sekolah manual, sejalan RLS).
 */

export class AuditError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "AuditError";
  }
}

export type AuditKategori =
  | "pengguna"
  | "moderasi"
  | "forum"
  | "keamanan"
  | "sistem";

export interface CatatAuditInput {
  schoolId: string | null;
  actorId: string | null;
  actorNama: string;
  kategori: AuditKategori;
  aksi: string;
  target?: string | null;
}

/**
 * Mencatat satu entri audit. Best-effort: kegagalan pencatatan tidak boleh
 * menggagalkan aksi utama pemanggil.
 */
export async function catatAudit(input: CatatAuditInput): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      schoolId: input.schoolId,
      actorId: input.actorId,
      actorNama: input.actorNama,
      kategori: input.kategori,
      aksi: input.aksi,
      target: input.target ?? null,
    });
  } catch (err) {
    console.error("Gagal mencatat audit:", err);
  }
}

export interface AuditRingkas {
  id: string;
  aktor: string;
  aksi: string;
  kategori: AuditKategori;
  target: string | null;
  createdAt: string;
}

/**
 * Daftar catatan aktivitas untuk admin, di-scope ke sekolahnya. `kategori`
 * opsional menyaring per kategori.
 */
export async function listAudit(
  profil: Profile | null,
  kategori?: AuditKategori,
  limit = 50,
): Promise<AuditRingkas[]> {
  if (!profil) throw new AuditError("Tidak terautentikasi.", 401);
  if (profil.role !== "admin") throw new AuditError("Khusus admin sekolah.", 403);
  if (!profil.schoolId) return [];

  const where = kategori
    ? and(
        eq(auditLogs.schoolId, profil.schoolId),
        eq(auditLogs.kategori, kategori),
      )
    : eq(auditLogs.schoolId, profil.schoolId);

  const rows = await db
    .select({
      id: auditLogs.id,
      aktor: auditLogs.actorNama,
      aksi: auditLogs.aksi,
      kategori: auditLogs.kategori,
      target: auditLogs.target,
      createdAt: auditLogs.createdAt,
    })
    .from(auditLogs)
    .where(where)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);

  return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
}
