"use client";

import { GraduationCap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Jenjang } from "@/lib/mock/beranda";
import { jenjangStyles, getJenjangStyle } from "@/lib/jenjang-style";

const urut: Jenjang[] = ["SD", "SMP", "SMA"];

/**
 * Menampilkan label jenjang aktif dan gaya penjelasan yang menyesuaikan.
 * Jenjang bisa diganti untuk pratinjau bagaimana penjelasan disesuaikan.
 */
export function JenjangStyleBar({
  jenjang,
  onChange,
}: {
  jenjang: Jenjang;
  onChange: (j: Jenjang) => void;
}) {
  const style = getJenjangStyle(jenjang);

  return (
    <div className="rounded-xl border bg-muted/30 p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <GraduationCap className="h-4 w-4" />
          </span>
          <div>
            <p className="flex items-center gap-1.5 text-sm font-medium">
              Penjelasan untuk
              <Badge variant={style.badgeVariant}>{style.label}</Badge>
            </p>
            <p className="text-xs text-muted-foreground">{style.ringkas}</p>
          </div>
        </div>

        <div
          role="tablist"
          aria-label="Sesuaikan jenjang"
          className="flex gap-1 self-start rounded-lg border bg-background p-1"
        >
          {urut.map((j) => {
            const active = j === jenjang;
            return (
              <button
                key={j}
                role="tab"
                aria-selected={active}
                onClick={() => onChange(j)}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent",
                )}
              >
                {jenjangStyles[j].label}
              </button>
            );
          })}
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{style.detail}</p>
    </div>
  );
}
