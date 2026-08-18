import "server-only";

import { z } from "zod";

import { chatJson } from "@/lib/ai/provider";
import { db } from "@/db";
import { reports } from "@/db/schema";

/**
 * Moderasi otomatis konten berbahaya dengan AI. Mengklasifikasikan teks ke
 * kategori terlarang (bahasa kasar, SARA, perundungan, spam, doxxing, konten
 * berbahaya) dengan skor risiko 0–1.
 *
 * Fail-open: bila layanan AI tidak tersedia, konten dianggap aman (skor 0) agar
 * ketersediaan tetap terjaga — laporan manual pengguna menjadi jaring pengaman.
 */

export type KategoriModerasi =
  | "aman"
  | "kasar"
  | "sara"
  | "perundungan"
  | "spam"
  | "doxxing"
  | "berbahaya";

const aiSchema = z.object({
  kategori: z.enum([
    "aman",
    "kasar",
    "sara",
    "perundungan",
    "spam",
    "doxxing",
    "berbahaya",
  ]),
  skor: z.number().min(0).max(1),
});

export interface HasilModerasi {
  aman: boolean;
  kategori: KategoriModerasi;
  skor: number;
  /** Skor ≥ 0.85 → blokir; 0.6–0.85 → tandai untuk ditinjau. */
  tindakan: "izinkan" | "tandai" | "blokir";
}

const BATAS_BLOKIR = 0.85;
const BATAS_TANDAI = 0.6;

export async function moderasiKonten(teks: string): Promise<HasilModerasi> {
  let kategori: KategoriModerasi = "aman";
  let skor = 0;

  try {
    const raw = await chatJson<unknown>(
      [
        {
          role: "system",
          content:
            "Kamu moderator konten untuk platform belajar anak Indonesia. " +
            "Klasifikasikan teks ke salah satu: aman, kasar, sara, perundungan, " +
            "spam, doxxing, berbahaya. Beri skor risiko 0–1. Balas HANYA JSON " +
            '{"kategori": "...", "skor": 0.0}.',
        },
        { role: "user", content: teks.slice(0, 4000) },
      ],
      { temperature: 0 },
    );
    const parsed = aiSchema.parse(raw);
    kategori = parsed.kategori;
    skor = parsed.kategori === "aman" ? 0 : parsed.skor;
  } catch {
    // Fail-open.
    return { aman: true, kategori: "aman", skor: 0, tindakan: "izinkan" };
  }

  const tindakan =
    skor >= BATAS_BLOKIR ? "blokir" : skor >= BATAS_TANDAI ? "tandai" : "izinkan";
  return { aman: tindakan === "izinkan", kategori, skor, tindakan };
}

/**
 * Mencatat laporan sistem (moderasi AI) untuk konten yang ditandai, agar masuk
 * antrean tinjauan moderator. reporter_profile_id null = laporan sistem.
 */
export async function laporSistem(
  targetType: "thread" | "post",
  targetId: string,
  kategori: KategoriModerasi,
): Promise<void> {
  if (kategori === "aman") return;
  await db.insert(reports).values({
    reporterProfileId: null,
    targetType,
    targetId,
    reason: kategori,
  });
}
