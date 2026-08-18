"use client";

import { useState } from "react";
import Link from "next/link";
import {
  History,
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  User,
  Settings,
  Lock,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRole } from "@/components/role/role-context";
import {
  auditLogs,
  kategoriLabel,
  type AuditKategori,
} from "@/lib/mock/audit";

const kategoriIkon: Record<AuditKategori, LucideIcon> = {
  pengguna: User,
  moderasi: ShieldAlert,
  forum: MessageSquare,
  keamanan: Lock,
  sistem: Settings,
};

const filterUrut: (AuditKategori | "semua")[] = [
  "semua",
  "pengguna",
  "moderasi",
  "forum",
  "keamanan",
  "sistem",
];

export function AuditView() {
  const { role } = useRole();
  const [filter, setFilter] = useState<AuditKategori | "semua">("semua");

  if (role !== "admin") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <ShieldCheck className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">Khusus admin sekolah</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Catatan aktivitas menampilkan tindakan penting di sekolah untuk
            akuntabilitas dan keamanan.
          </p>
          <Button asChild variant="outline">
            <Link href="/akun">Kembali ke Akun</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const items =
    filter === "semua"
      ? auditLogs
      : auditLogs.filter((l) => l.kategori === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-xl border bg-accent/30 p-3">
        <History className="h-5 w-5 text-primary" />
        <p className="text-sm text-muted-foreground">
          {auditLogs.length} aktivitas tercatat. Catatan ini tidak dapat diubah.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {filterUrut.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors",
              filter === f
                ? "border-primary bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent",
            )}
          >
            {f === "semua" ? "Semua" : kategoriLabel[f]}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="divide-y p-0">
          {items.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">
              Tidak ada aktivitas pada kategori ini.
            </p>
          ) : (
            items.map((l) => {
              const Icon = kategoriIkon[l.kategori];
              return (
                <div key={l.id} className="flex items-start gap-3 p-4">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">{l.aktor}</p>
                      <Badge variant="secondary" className="text-[10px]">
                        {kategoriLabel[l.kategori]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {l.aksi}
                      {l.target ? (
                        <span className="text-foreground"> · {l.target}</span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {l.waktu} · {l.timeAgo}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
