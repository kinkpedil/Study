"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Paperclip, Star } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  formatTanggal,
  sisaTenggat,
  type TugasGuru,
  type Pengumpulan,
} from "@/lib/mock/tugas";

function initials(name: string) {
  return name
    .split(" ")
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function GuruGrading({
  tugas,
  pengumpulan,
}: {
  tugas: TugasGuru;
  pengumpulan: Pengumpulan[];
}) {
  const [items, setItems] = useState<Pengumpulan[]>(pengumpulan);
  const [tab, setTab] = useState<"perlu" | "semua">("perlu");

  const dinilai = items.filter((i) => i.status === "dinilai").length;
  const list = useMemo(
    () => (tab === "perlu" ? items.filter((i) => i.status === "perlu") : items),
    [items, tab],
  );

  function simpanNilai(id: string, nilai: number, komentar: string) {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, status: "dinilai", nilai, komentar } : i,
      ),
    );
  }

  return (
    <div className="space-y-4">
      {/* Ringkasan tugas */}
      <Card>
        <CardContent className="space-y-3 p-5">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="text-[10px]">
              {tugas.mapel}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              Kelas {tugas.kelas}
            </Badge>
          </div>
          <h1 className="text-xl font-bold leading-tight">{tugas.judul}</h1>
          <p className="text-xs text-muted-foreground">
            Tenggat {formatTanggal(tugas.tenggat)} ·{" "}
            {sisaTenggat(tugas.tenggat).teks}
          </p>
          <div>
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {dinilai}/{items.length} pengumpulan dinilai
              </span>
              <span>{tugas.terkumpul} terkumpul</span>
            </div>
            <Progress
              value={
                items.length ? Math.round((dinilai / items.length) * 100) : 0
              }
              className="h-1.5"
              indicatorClassName="bg-success"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tab */}
      <div className="flex gap-1.5">
        {(
          [
            ["perlu", `Perlu Dinilai (${items.filter((i) => i.status === "perlu").length})`],
            ["semua", `Semua (${items.length})`],
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

      {list.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {tab === "perlu"
              ? "Semua pengumpulan sudah dinilai. 🎉"
              : "Belum ada pengumpulan."}
          </CardContent>
        </Card>
      ) : (
        list.map((s) => (
          <SubmissionCard key={s.id} sub={s} onSimpan={simpanNilai} />
        ))
      )}
    </div>
  );
}

function SubmissionCard({
  sub,
  onSimpan,
}: {
  sub: Pengumpulan;
  onSimpan: (id: string, nilai: number, komentar: string) => void;
}) {
  const [nilai, setNilai] = useState(sub.nilai?.toString() ?? "");
  const [komentar, setKomentar] = useState(sub.komentar ?? "");

  const nilaiNum = Number(nilai);
  const valid = nilai !== "" && nilaiNum >= 0 && nilaiNum <= 100;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {initials(sub.siswa)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-sm">{sub.siswa}</CardTitle>
            <p className="text-xs text-muted-foreground">
              dikumpul {formatTanggal(sub.waktu)}
            </p>
          </div>
        </div>
        {sub.status === "dinilai" && (
          <Badge variant="success" className="gap-1">
            <Star className="h-3 w-3" />
            {sub.nilai}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-lg border bg-muted/30 p-3 text-sm">
          {sub.tipe === "file" ? (
            <span className="inline-flex items-center gap-1.5">
              <Paperclip className="h-4 w-4 text-primary" />
              {sub.fileNama ?? "lampiran.pdf"}
            </span>
          ) : (
            sub.jawaban
          )}
        </div>

        {sub.status === "dinilai" ? (
          sub.komentar && (
            <p className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              {sub.komentar}
            </p>
          )
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (valid) onSimpan(sub.id, nilaiNum, komentar.trim());
            }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={100}
                value={nilai}
                onChange={(e) => setNilai(e.target.value)}
                placeholder="Nilai 0–100"
                aria-label="Nilai"
                className="w-32"
              />
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
            <Textarea
              value={komentar}
              onChange={(e) => setKomentar(e.target.value)}
              placeholder="Komentar / umpan balik untuk siswa…"
              className="min-h-20"
            />
            <div className="flex justify-end">
              <Button type="submit" size="sm" disabled={!valid}>
                Simpan Nilai
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
