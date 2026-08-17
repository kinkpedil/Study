"use client";

import Link from "next/link";
import {
  Megaphone,
  MessageSquare,
  PlusCircle,
  Lock,
  Globe,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRole } from "@/components/role/role-context";
import {
  forumThreads,
  pengumumanSekolah,
  pengaduanSekolah,
  type PengaduanStatus,
} from "@/lib/mock/forum";
import { ThreadCard } from "./thread-card";

const statusMeta: Record<
  PengaduanStatus,
  { label: string; variant: "secondary" | "warning" | "success" }
> = {
  baru: { label: "Baru", variant: "secondary" },
  diproses: { label: "Diproses", variant: "warning" },
  selesai: { label: "Selesai", variant: "success" },
};

export function SchoolForumView() {
  const { profile } = useRole();
  const threads = forumThreads.filter((t) => t.scope === "sekolah");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Ruang internal <strong>{profile.school}</strong>: pengumuman,
          diskusi, dan pengajuan masalah.
        </p>
        {profile.role === "admin" && (
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <Link href="/forum/kelola">Kelola Forum</Link>
          </Button>
        )}
      </div>

      {/* Pengumuman */}
      <section aria-label="Pengumuman" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Pengumuman</h2>
          </div>
          {profile.role === "admin" && (
            <Button asChild variant="outline" size="sm">
              <Link href="/forum/pengumuman/baru">
                <PlusCircle className="h-4 w-4" />
                Buat Pengumuman
              </Link>
            </Button>
          )}
        </div>
        <div className="space-y-2">
          {pengumumanSekolah.map((p) => (
            <Card key={p.id} className="border-l-4 border-l-warning">
              <CardContent className="p-4">
                <p className="font-medium">{p.judul}</p>
                <p className="mt-1 text-sm text-muted-foreground">{p.isi}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {p.penulis} · {p.timeAgo}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pengajuan Masalah */}
      <section aria-label="Pengajuan masalah" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Pengajuan Masalah</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/forum/pengaduan/baru">
              <PlusCircle className="h-4 w-4" />
              Ajukan Masalah
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y">
              {pengaduanSekolah.map((p) => {
                const meta = statusMeta[p.status];
                return (
                  <li
                    key={p.id}
                    className="flex items-start gap-3 px-5 py-3.5"
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                        p.visibility === "privat"
                          ? "bg-muted text-muted-foreground"
                          : "bg-primary/10 text-primary",
                      )}
                    >
                      {p.visibility === "privat" ? (
                        <Lock className="h-4 w-4" />
                      ) : (
                        <Globe className="h-4 w-4" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium">
                          {p.judul}
                        </p>
                        <Badge variant={meta.variant} className="text-[10px]">
                          {meta.label}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {p.visibility === "privat" ? "Privat" : "Publik"}
                        </Badge>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {p.ringkas}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {p.pelapor} · {p.timeAgo}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Diskusi Sekolah */}
      <section aria-label="Diskusi sekolah" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Diskusi Sekolah</h2>
          </div>
          <Button asChild size="sm">
            <Link href="/forum/baru">
              <PlusCircle className="h-4 w-4" />
              Buat Diskusi
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="p-0">
            {threads.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Belum ada diskusi sekolah.
              </p>
            ) : (
              threads.map((t) => <ThreadCard key={t.id} thread={t} />)
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
