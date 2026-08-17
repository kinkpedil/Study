"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldAlert, Sparkles, Trash2, Check, ShieldCheck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRole } from "@/components/role/role-context";
import {
  laporanModerasi,
  alasanLaporanLabel,
  type Laporan,
  type LaporanStatus,
} from "@/lib/mock/forum";

const statusVariant: Record<
  LaporanStatus,
  "secondary" | "warning" | "success" | "destructive"
> = {
  menunggu: "warning",
  ditangani: "success",
  ditolak: "secondary",
};
const statusLabel: Record<LaporanStatus, string> = {
  menunggu: "Menunggu",
  ditangani: "Ditangani",
  ditolak: "Ditolak",
};

export function ModerasiView() {
  const { profile } = useRole();
  const [laporan, setLaporan] = useState<Laporan[]>(laporanModerasi);

  // Moderasi untuk guru & admin (moderator).
  if (profile.role === "siswa") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <ShieldAlert className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">Khusus moderator</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Halaman moderasi hanya untuk guru dan admin. Kamu bisa melaporkan
            konten lewat tombol laporan di tiap diskusi.
          </p>
          <Button asChild variant="outline">
            <Link href="/forum">Kembali ke Forum</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  function tangani(id: string, status: LaporanStatus) {
    setLaporan((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status } : l)),
    );
  }

  const menunggu = laporan.filter((l) => l.status === "menunggu");
  const selesai = laporan.filter((l) => l.status !== "menunggu");

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-xl border bg-accent/30 p-3">
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <p className="text-sm text-muted-foreground">
          Moderasi gabungan: AI menandai konten berisiko (bahasa kasar, SARA,
          perundungan, spam, doxxing, konten berbahaya) untuk ditinjau manual.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">
          Perlu ditinjau ({menunggu.length})
        </h2>
        {menunggu.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Tidak ada laporan yang menunggu. 🎉
            </CardContent>
          </Card>
        ) : (
          menunggu.map((l) => (
            <Card key={l.id}>
              <CardContent className="space-y-3 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="destructive" className="text-[10px]">
                    {alasanLaporanLabel[l.alasan]}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {l.targetTipe === "thread" ? "Topik" : "Balasan"}
                  </Badge>
                  {l.aiSkor !== null && (
                    <Badge variant="warning" className="gap-1 text-[10px]">
                      <Sparkles className="h-3 w-3" />
                      AI {Math.round(l.aiSkor * 100)}%
                    </Badge>
                  )}
                </div>
                <blockquote
                  className={cn(
                    "rounded-lg border-l-4 border-l-destructive bg-destructive/5 px-3 py-2 text-sm italic",
                  )}
                >
                  “{l.cuplikan}”
                </blockquote>
                <p className="text-xs text-muted-foreground">
                  oleh {l.penulisKonten} · dilaporkan {l.pelapor} · {l.timeAgo}
                </p>
                <div className="flex flex-wrap gap-2 border-t pt-3">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => tangani(l.id, "ditangani")}
                  >
                    <Trash2 className="h-4 w-4" />
                    Hapus konten
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => tangani(l.id, "ditolak")}
                  >
                    <Check className="h-4 w-4" />
                    Tandai aman
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </section>

      {selesai.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Riwayat moderasi
          </h2>
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y">
                {selesai.map((l) => (
                  <li
                    key={l.id}
                    className="flex items-center justify-between gap-3 px-5 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm">“{l.cuplikan}”</p>
                      <p className="text-xs text-muted-foreground">
                        {alasanLaporanLabel[l.alasan]} · {l.timeAgo}
                      </p>
                    </div>
                    <Badge
                      variant={statusVariant[l.status]}
                      className="shrink-0 text-[10px]"
                    >
                      {l.status === "ditangani" && (
                        <ShieldCheck className="mr-1 h-3 w-3" />
                      )}
                      {statusLabel[l.status]}
                    </Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
