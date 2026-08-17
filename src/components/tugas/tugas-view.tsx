"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Clock,
  FileText,
  Paperclip,
  PlusCircle,
  Users,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useRole } from "@/components/role/role-context";
import {
  tugasSiswa,
  tugasGuru,
  statusTugas,
  sisaTenggat,
  formatTanggal,
} from "@/lib/mock/tugas";

export function TugasView() {
  const { profile } = useRole();
  return profile.role === "siswa" ? <TugasSiswaView /> : <TugasGuruView />;
}

/* ------------------------------ Siswa ------------------------------ */

function TugasSiswaView() {
  const [tab, setTab] = useState<"perlu" | "selesai">("perlu");

  const { perlu, selesai } = useMemo(() => {
    const perlu = tugasSiswa.filter(
      (t) => t.status === "belum" || t.status === "terlambat",
    );
    const selesai = tugasSiswa.filter(
      (t) => t.status === "terkumpul" || t.status === "dinilai",
    );
    return { perlu, selesai };
  }, []);

  const list = tab === "perlu" ? perlu : selesai;

  return (
    <div className="space-y-4">
      <div className="flex gap-1.5">
        {(
          [
            ["perlu", `Perlu Dikerjakan (${perlu.length})`],
            ["selesai", `Selesai (${selesai.length})`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              tab === key
                ? "border-primary bg-primary/10 text-primary"
                : "border-input text-muted-foreground hover:bg-accent",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {list.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Tidak ada tugas di sini.
            </CardContent>
          </Card>
        ) : (
          list.map((t) => {
            const meta = statusTugas(t.status);
            const sisa = sisaTenggat(t.tenggat);
            return (
              <Link key={t.id} href={`/tugas/${t.id}`} className="block">
                <Card className="transition-colors hover:border-primary/40">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge variant="secondary" className="text-[10px]">
                            {t.mapel}
                          </Badge>
                          <Badge variant={meta.variant} className="text-[10px]">
                            {meta.label}
                          </Badge>
                          {t.tipe === "file" ? (
                            <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                          ) : (
                            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </div>
                        <p className="mt-1.5 font-medium leading-snug">
                          {t.judul}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t.guru} · tenggat {formatTanggal(t.tenggat)}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        {t.status === "dinilai" ? (
                          <span className="text-lg font-bold text-success">
                            {t.nilai}
                          </span>
                        ) : (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 text-xs",
                              sisa.lewat
                                ? "text-destructive"
                                : sisa.mendesak
                                  ? "text-warning"
                                  : "text-muted-foreground",
                            )}
                          >
                            <Clock className="h-3.5 w-3.5" />
                            {sisa.teks}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ------------------------------ Guru ------------------------------ */

function TugasGuruView() {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/tugas/baru">
            <PlusCircle className="h-4 w-4" />
            Buat Tugas
          </Link>
        </Button>
      </div>

      <div className="space-y-3">
        {tugasGuru.map((t) => {
          const sisa = sisaTenggat(t.tenggat);
          const persen = Math.round((t.terkumpul / t.jumlahSiswa) * 100);
          return (
            <Link key={t.id} href={`/tugas/${t.id}`} className="block">
              <Card className="transition-colors hover:border-primary/40">
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="secondary" className="text-[10px]">
                          {t.mapel}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          Kelas {t.kelas}
                        </Badge>
                        {t.perluDinilai > 0 && (
                          <Badge variant="warning" className="text-[10px]">
                            {t.perluDinilai} perlu dinilai
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1.5 font-medium leading-snug">
                        {t.judul}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {sisa.teks}
                    </span>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {t.terkumpul}/{t.jumlahSiswa} terkumpul
                      </span>
                      <span>{persen}%</span>
                    </div>
                    <Progress value={persen} className="h-1.5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
