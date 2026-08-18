"use client";

import Link from "next/link";
import { BellRing } from "lucide-react";

import { cn } from "@/lib/utils";
import { tugasSiswa, sisaTenggat, formatTanggal } from "@/lib/mock/tugas";
import { DeadlineBadge } from "./deadline-badge";

/**
 * Panel pengingat: menyorot tugas yang tenggatnya sudah dekat atau terlewat,
 * agar siswa tidak kelewatan. Muncul hanya bila ada yang perlu diingatkan.
 */
export function PengingatTugas() {
  const perlu = tugasSiswa
    .filter((t) => t.status === "belum" || t.status === "terlambat")
    .map((t) => ({ t, sisa: sisaTenggat(t.tenggat) }))
    .filter(({ sisa }) => sisa.lewat || sisa.mendesak)
    .sort((a, b) => a.t.tenggat.localeCompare(b.t.tenggat))
    .slice(0, 3);

  if (perlu.length === 0) return null;

  const adaLewat = perlu.some(({ sisa }) => sisa.lewat);

  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        adaLewat ? "border-destructive/40 bg-destructive/5" : "border-warning/40 bg-warning/10",
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <BellRing
          className={cn(
            "h-4 w-4",
            adaLewat ? "text-destructive" : "text-warning",
          )}
        />
        <p className="text-sm font-semibold">Pengingat tenggat</p>
      </div>
      <ul className="space-y-1.5">
        {perlu.map(({ t }) => (
          <li key={t.id}>
            <Link
              href={`/tugas/${t.id}`}
              className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-background/60"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">
                  {t.judul}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {t.mapel} · tenggat {formatTanggal(t.tenggat)}
                </span>
              </span>
              <DeadlineBadge tenggat={t.tenggat} className="shrink-0" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
