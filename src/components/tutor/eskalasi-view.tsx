"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, LifeBuoy, ShieldAlert } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useRole } from "@/components/role/role-context";
import { eskalasiGuru, type EskalasiGuru } from "@/lib/mock/tutor";

function initials(name: string) {
  return name
    .split(" ")
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function EskalasiView() {
  const { profile } = useRole();
  const [items, setItems] = useState<EskalasiGuru[]>(eskalasiGuru);

  if (profile.role === "siswa") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <ShieldAlert className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">Khusus guru</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Halaman ini menampilkan permintaan bantuan yang diteruskan siswa ke
            guru.
          </p>
          <Button asChild variant="outline">
            <Link href="/tutor">Kembali ke Tutor AI</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const baru = items.filter((i) => i.status === "baru");

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-xl border bg-accent/30 p-3">
        <LifeBuoy className="h-5 w-5 text-primary" />
        <p className="text-sm text-muted-foreground">
          {baru.length} permintaan bantuan baru dari siswa yang meneruskan sesi
          tutor AI mereka.
        </p>
      </div>

      {items.map((e) => (
        <Card key={e.id} className={cn(e.status === "baru" && "border-primary/30")}>
          <CardContent className="flex items-start gap-3 p-4">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {initials(e.siswa)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium">{e.siswa}</p>
                <Badge variant="smp" className="text-[10px]">
                  {e.jenjang}
                </Badge>
                <Badge variant="secondary" className="text-[10px]">
                  {e.mapel}
                </Badge>
                {e.status === "ditangani" && (
                  <Badge variant="success" className="text-[10px]">
                    Ditangani
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-sm font-medium">{e.judul}</p>
              <p className="text-sm text-muted-foreground">“{e.catatan}”</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {e.timeAgo}
              </p>
            </div>
            {e.status === "baru" && (
              <Button
                size="sm"
                variant="outline"
                className="shrink-0"
                onClick={() =>
                  setItems((prev) =>
                    prev.map((x) =>
                      x.id === e.id ? { ...x, status: "ditangani" } : x,
                    ),
                  )
                }
              >
                <Check className="h-4 w-4" />
                Tandai ditangani
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
