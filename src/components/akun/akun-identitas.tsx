"use client";

import { Mail, School, CalendarDays } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useRole } from "@/components/role/role-context";
import { akunProfil, roleLabel } from "@/lib/mock/akun";

function initials(name: string) {
  return name
    .split(" ")
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

/** Kartu identitas akun: avatar, nama, peran, sekolah, email, tanggal gabung. */
export function AkunIdentitas() {
  const { role } = useRole();
  const p = akunProfil[role];

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <Avatar className="h-16 w-16 shrink-0">
          <AvatarFallback className="bg-primary/10 text-lg text-primary">
            {initials(p.nama)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">{p.nama}</h2>
            {p.jenjang ? (
              <Badge variant="smp">
                {p.jenjang}
                {p.kelas ? ` · ${p.kelas}` : ""}
              </Badge>
            ) : (
              <Badge variant="secondary">{roleLabel[p.role]}</Badge>
            )}
          </div>
          <div className="mt-2 grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
            <span className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0" />
              <span className="truncate">{p.email}</span>
            </span>
            <span className="flex items-center gap-2">
              <School className="h-4 w-4 shrink-0" />
              <span className="truncate">{p.sekolah}</span>
            </span>
            <span className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 shrink-0" />
              Bergabung {p.bergabung}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
