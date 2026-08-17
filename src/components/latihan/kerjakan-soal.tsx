"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ChevronLeft, ChevronRight, Save } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  contohLatihan,
  jawabanStorageKey,
  type LatihanSet,
} from "@/lib/mock/soal";

type Jawaban = Record<string, string>;

export function KerjakanSoal({
  latihan = contohLatihan,
}: {
  latihan?: LatihanSet;
}) {
  const total = latihan.soal.length;
  const [index, setIndex] = useState(0);
  const [jawaban, setJawaban] = useState<Jawaban>({});
  const [selesai, setSelesai] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const storageKey = jawabanStorageKey(latihan.id);

  // Muat jawaban tersimpan dari localStorage saat komponen dipasang.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      // Sinkronisasi dari sistem eksternal (localStorage) saat mount; dilakukan
      // di effect agar aman SSR dan tidak memicu hydration mismatch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setJawaban(JSON.parse(raw) as Jawaban);
    } catch {
      /* abaikan jawaban rusak */
    }
    setHydrated(true);
  }, [storageKey]);

  // Simpan setiap perubahan jawaban ke localStorage.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(jawaban));
    } catch {
      /* penyimpanan penuh / tidak tersedia */
    }
  }, [jawaban, hydrated, storageKey]);

  const soal = latihan.soal[index];
  const terjawab = Object.values(jawaban).filter((v) => v.trim() !== "").length;
  const persen = Math.round((terjawab / total) * 100);

  function setAnswer(value: string) {
    setJawaban((prev) => ({ ...prev, [soal.id]: value }));
  }

  function resetJawaban() {
    setJawaban({});
    setIndex(0);
    setSelesai(false);
  }

  if (selesai) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
            <Check className="h-7 w-7" />
          </span>
          <div>
            <h2 className="text-lg font-semibold">Latihan selesai!</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Kamu menjawab {terjawab} dari {total} soal. Jawaban tersimpan di
              perangkat ini.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setSelesai(false)}>
              Periksa kembali
            </Button>
            <Button asChild>
              <Link href="/latihan/pembahasan">Lihat kunci &amp; pembahasan</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progres + navigator nomor */}
      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              Soal {index + 1} dari {total}
            </span>
            <span className="text-muted-foreground">
              {terjawab}/{total} terjawab
              {hydrated && (
                <span className="ml-2 inline-flex items-center gap-1 text-xs text-success">
                  <Save className="h-3 w-3" /> tersimpan
                </span>
              )}
            </span>
          </div>
          <Progress value={persen} />
          <div className="flex flex-wrap gap-2 pt-1">
            {latihan.soal.map((s, i) => {
              const dijawab = (jawaban[s.id] ?? "").trim() !== "";
              const aktif = i === index;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-current={aktif ? "true" : undefined}
                  aria-label={`Soal ${i + 1}${dijawab ? ", sudah dijawab" : ""}`}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md border text-sm font-medium transition-colors",
                    aktif && "ring-2 ring-ring",
                    dijawab
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input hover:bg-accent",
                  )}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Soal aktif */}
      <Card>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <CardTitle className="text-base leading-relaxed">
            {soal.nomor}. {soal.pertanyaan}
          </CardTitle>
          <Badge variant="secondary" className="shrink-0">
            {soal.tipe === "esai" ? "Esai" : "Pilihan Ganda"}
          </Badge>
        </CardHeader>
        <CardContent>
          {soal.tipe === "pilihan_ganda" && soal.opsi ? (
            <ul className="space-y-2" role="radiogroup" aria-label="Pilihan jawaban">
              {soal.opsi.map((o) => {
                const dipilih = jawaban[soal.id] === o.id;
                return (
                  <li key={o.id}>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={dipilih}
                      onClick={() => setAnswer(o.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        dipilih
                          ? "border-primary bg-primary/10"
                          : "border-input hover:bg-accent",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold uppercase",
                          dipilih
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input",
                        )}
                      >
                        {o.id}
                      </span>
                      {o.teks}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Textarea
              value={jawaban[soal.id] ?? ""}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Tulis jawaban dan langkah pengerjaanmu di sini…"
              className="min-h-40"
            />
          )}
        </CardContent>
      </Card>

      {/* Navigasi */}
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
        >
          <ChevronLeft className="h-4 w-4" />
          Sebelumnya
        </Button>

        <Button variant="ghost" size="sm" onClick={resetJawaban}>
          Reset
        </Button>

        {index < total - 1 ? (
          <Button onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}>
            Berikutnya
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={() => setSelesai(true)}>
            Selesai
            <Check className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
