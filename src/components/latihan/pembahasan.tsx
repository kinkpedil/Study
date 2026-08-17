"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, X, CircleHelp, RotateCcw } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  contohLatihan,
  jawabanStorageKey,
  nilaiLatihan,
  type LatihanSet,
  type HasilPenilaian,
} from "@/lib/mock/soal";

type Jawaban = Record<string, string>;

export function Pembahasan({
  latihan = contohLatihan,
}: {
  latihan?: LatihanSet;
}) {
  const [jawaban, setJawaban] = useState<Jawaban>({});
  const [hasil, setHasil] = useState<HasilPenilaian | null>(null);

  useEffect(() => {
    let j: Jawaban = {};
    try {
      const raw = localStorage.getItem(jawabanStorageKey(latihan.id));
      if (raw) j = JSON.parse(raw) as Jawaban;
    } catch {
      /* abaikan */
    }
    // Sinkronisasi dari localStorage + penilaian saat mount (aman SSR).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setJawaban(j);
    setHasil(nilaiLatihan(latihan, j));
  }, [latihan]);

  return (
    <div className="space-y-4">
      {/* Ringkasan nilai */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full text-lg font-bold",
                (hasil?.nilai ?? 0) >= 80
                  ? "bg-success/15 text-success"
                  : (hasil?.nilai ?? 0) >= 60
                    ? "bg-warning/20 text-warning"
                    : "bg-destructive/15 text-destructive",
              )}
            >
              {hasil ? hasil.nilai : 0}
              <span className="text-[10px] font-medium opacity-70">nilai</span>
            </div>
            <div>
              <p className="text-sm font-medium">
                {hasil ? `${hasil.benar} dari ${hasil.totalPG}` : "—"} pilihan
                ganda benar
              </p>
              {hasil && hasil.totalEsai > 0 && (
                <p className="text-xs text-muted-foreground">
                  {hasil.esaiTerisi}/{hasil.totalEsai} esai terisi · menunggu
                  tinjauan
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/latihan/kerjakan">
                <RotateCcw className="h-4 w-4" />
                Ulangi
              </Link>
            </Button>
            <Button asChild>
              <Link href="/latihan/riwayat">Lihat riwayat</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Kunci & pembahasan per soal */}
      {latihan.soal.map((s) => {
        const jawab = jawaban[s.id] ?? "";
        const benar = s.tipe === "pilihan_ganda" && jawab === s.kunci;

        return (
          <Card key={s.id}>
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <CardTitle className="text-base leading-relaxed">
                {s.nomor}. {s.pertanyaan}
              </CardTitle>
              {s.tipe === "pilihan_ganda" ? (
                <Badge
                  variant={benar ? "success" : "destructive"}
                  className="shrink-0"
                >
                  {benar ? (
                    <>
                      <Check className="mr-1 h-3 w-3" /> Benar
                    </>
                  ) : (
                    <>
                      <X className="mr-1 h-3 w-3" /> Salah
                    </>
                  )}
                </Badge>
              ) : (
                <Badge variant="secondary" className="shrink-0">
                  <CircleHelp className="mr-1 h-3 w-3" /> Esai
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {s.tipe === "pilihan_ganda" && s.opsi ? (
                <ul className="space-y-2">
                  {s.opsi.map((o) => {
                    const isKunci = o.id === s.kunci;
                    const isPilihan = o.id === jawab;
                    return (
                      <li
                        key={o.id}
                        className={cn(
                          "flex items-center gap-3 rounded-lg border p-3 text-sm",
                          isKunci && "border-success bg-success/10",
                          isPilihan &&
                            !isKunci &&
                            "border-destructive bg-destructive/10",
                          !isKunci && !isPilihan && "border-input",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold uppercase",
                            isKunci
                              ? "border-success bg-success text-primary-foreground"
                              : isPilihan
                                ? "border-destructive bg-destructive text-destructive-foreground"
                                : "border-input",
                          )}
                        >
                          {o.id}
                        </span>
                        <span className="flex-1">{o.teks}</span>
                        {isKunci && (
                          <span className="text-xs font-medium text-success">
                            Kunci
                          </span>
                        )}
                        {isPilihan && !isKunci && (
                          <span className="text-xs font-medium text-destructive">
                            Jawabanmu
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      Jawabanmu
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm">
                      {jawab.trim() ? jawab : "— (tidak dijawab)"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-success/40 bg-success/10 p-3">
                    <p className="text-xs font-medium text-success">
                      Contoh jawaban
                    </p>
                    <p className="mt-1 text-sm">{s.kunci}</p>
                  </div>
                </div>
              )}

              <div className="rounded-lg bg-accent/40 p-3">
                <p className="text-xs font-semibold text-accent-foreground">
                  Pembahasan
                </p>
                <p className="mt-1 text-sm text-foreground/90">
                  {s.pembahasan}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
