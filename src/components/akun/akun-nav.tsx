"use client";

import {
  Lock,
  Monitor,
  Shield,
  Sliders,
  User,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { akunSections, type AkunSection } from "@/lib/mock/akun";

const ikon: Record<AkunSection["icon"], LucideIcon> = {
  user: User,
  shield: Shield,
  monitor: Monitor,
  sliders: Sliders,
  lock: Lock,
};

/**
 * Navigasi bagian halaman Akun. Menautkan ke anchor tiap bagian di halaman
 * yang sama (mobile: gulir horizontal; desktop: daftar sticky).
 */
export function AkunNav() {
  return (
    <nav
      aria-label="Bagian akun"
      className="flex gap-2 overflow-x-auto pb-1 lg:sticky lg:top-20 lg:flex-col lg:overflow-visible lg:pb-0"
    >
      {akunSections.map((s) => {
        const Icon = ikon[s.icon];
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={cn(
              "group flex shrink-0 items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors hover:border-primary/40 hover:bg-accent/40 lg:shrink",
            )}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </span>
            <span className="hidden min-w-0 lg:block">
              <span className="block font-medium leading-tight">{s.label}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {s.deskripsi}
              </span>
            </span>
            <span className="font-medium lg:hidden">{s.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
