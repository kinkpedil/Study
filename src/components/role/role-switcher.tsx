"use client";

import { GraduationCap, Presentation, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Role } from "@/lib/mock/roles";
import { useRole } from "./role-context";

const options: { role: Role; label: string; icon: typeof GraduationCap }[] = [
  { role: "siswa", label: "Siswa", icon: GraduationCap },
  { role: "guru", label: "Guru", icon: Presentation },
  { role: "admin", label: "Admin", icon: ShieldCheck },
];

/**
 * Pengalih peran untuk pratinjau (mock). Memudahkan verifikasi tampilan tiap
 * peran di browser sebelum autentikasi asli tersedia.
 */
export function RoleSwitcher() {
  const { role, setRole } = useRole();

  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-muted/30 p-2 sm:flex-row sm:items-center sm:justify-between sm:px-3">
      <p className="px-1 text-xs text-muted-foreground">
        Pratinjau peran (data tiruan)
      </p>
      <div
        role="tablist"
        aria-label="Pilih peran"
        className="grid grid-cols-3 gap-1 sm:flex"
      >
        {options.map((o) => {
          const Icon = o.icon;
          const active = role === o.role;
          return (
            <button
              key={o.role}
              role="tab"
              aria-selected={active}
              onClick={() => setRole(o.role)}
              className={cn(
                "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
