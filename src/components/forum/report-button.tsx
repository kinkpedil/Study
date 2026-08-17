"use client";

import { useEffect, useRef, useState } from "react";
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

/**
 * Tombol lapor konten yang dapat dipakai di seluruh forum (topik & balasan).
 * `target` menyebut apa yang dilaporkan; `align` mengatur arah dropdown.
 */
export function ReportButton({
  target = "konten ini",
  align = "right",
}: {
  target?: string;
  align?: "left" | "right";
}) {
  const [buka, setBuka] = useState(false);
  const [terkirim, setTerkirim] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Tutup saat klik di luar.
  useEffect(() => {
    if (!buka) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setBuka(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [buka]);

  if (terkirim) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-success">
        <Check className="h-3.5 w-3.5" />
        Laporan terkirim
      </span>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setBuka((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={buka}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
      >
        <Flag className="h-3.5 w-3.5" />
        Laporkan
      </button>

      {buka && (
        <div
          role="menu"
          className={cn(
            "absolute z-20 mt-1 w-52 overflow-hidden rounded-lg border bg-popover shadow-lg",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          <p className="border-b px-3 py-2 text-xs font-medium">
            Laporkan {target} karena…
          </p>
          <ul>
            {alasanUrut.map((a) => (
              <li key={a}>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setBuka(false);
                    setTerkirim(true);
                  }}
                  className="block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
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
