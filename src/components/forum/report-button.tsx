"use client";

import { useState } from "react";
import { Flag, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { alasanLaporanLabel, type AlasanLaporan } from "@/lib/mock/forum";

const alasanUrut: AlasanLaporan[] = [
  "kasar",
  "sara",
  "perundungan",
  "spam",
  "doxxing",
  "berbahaya",
  "lainnya",
];

/** Tombol laporkan konten dengan pemilihan alasan (mock: kirim lokal). */
export function ReportButton() {
  const [buka, setBuka] = useState(false);
  const [terkirim, setTerkirim] = useState(false);

  if (terkirim) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-success">
        <Check className="h-3.5 w-3.5" />
        Laporan terkirim
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setBuka((v) => !v)}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
      >
        <Flag className="h-3.5 w-3.5" />
        Laporkan
      </button>

      {buka && (
        <div className="absolute right-0 z-20 mt-1 w-52 overflow-hidden rounded-lg border bg-popover shadow-lg">
          <p className="border-b px-3 py-2 text-xs font-medium">
            Laporkan karena…
          </p>
          <ul>
            {alasanUrut.map((a) => (
              <li key={a}>
                <button
                  type="button"
                  onClick={() => {
                    setBuka(false);
                    setTerkirim(true);
                  }}
                  className={cn(
                    "block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-accent",
                  )}
                >
                  {alasanLaporanLabel[a]}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
