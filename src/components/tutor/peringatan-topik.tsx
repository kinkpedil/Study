"use client";

import { HeartHandshake, ShieldAlert } from "lucide-react";

import { cn } from "@/lib/utils";
import type { TopikBerisiko } from "@/lib/mock/tutor";
import { EskalasiGuru } from "./eskalasi-guru";

/**
 * Peringatan lembut saat siswa menyentuh topik berisiko. Tutor tidak menjawab
 * seperti biasa, melainkan mengarahkan ke bantuan orang dewasa/guru.
 */
export function PeringatanTopik({
  info,
  className,
}: {
  info: TopikBerisiko;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-2xl border border-amber-300/60 bg-amber-50 p-4 text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-100",
        className,
      )}
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-200">
        {info.kategori === "keselamatan-diri" ? (
          <HeartHandshake className="h-4 w-4" />
        ) : (
          <ShieldAlert className="h-4 w-4" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{info.judul}</p>
        <p className="mt-1 text-sm leading-relaxed">{info.pesan}</p>
        {info.eskalasi && (
          <div className="mt-3">
            <EskalasiGuru />
          </div>
        )}
      </div>
    </div>
  );
}
