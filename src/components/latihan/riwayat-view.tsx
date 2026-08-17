import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProgressChart } from "./progress-chart";
import {
  riwayatLatihan,
  ringkasRiwayat,
  rataRataPerMapel,
  type RiwayatItem,
} from "@/lib/mock/riwayat";

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function nilaiVariant(n: number) {
  if (n >= 80) return "success" as const;
  if (n >= 60) return "warning" as const;
  return "destructive" as const;
}

export function RiwayatView() {
  const items = riwayatLatihan;
  const ringkas = ringkasRiwayat(items);
  const perMapel = rataRataPerMapel(items);
  const urut: RiwayatItem[] = [...items].reverse(); // terbaru dulu untuk daftar

  const TrenIcon =
    ringkas.trenPersen > 0
      ? ArrowUpRight
      : ringkas.trenPersen < 0
        ? ArrowDownRight
        : Minus;
  const trenClass =
    ringkas.trenPersen > 0
      ? "text-success"
      : ringkas.trenPersen < 0
        ? "text-destructive"
        : "text-muted-foreground";

  return (
    <div className="space-y-6">
      {/* Ringkasan angka */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold tabular-nums">
              {ringkas.totalLatihan}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Latihan</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold tabular-nums">
              {ringkas.rataRata}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Rata-rata</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold tabular-nums">
              {ringkas.nilaiTertinggi}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Tertinggi</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p
              className={`flex items-center gap-1 text-2xl font-bold tabular-nums ${trenClass}`}
            >
              <TrenIcon className="h-5 w-5" />
              {ringkas.trenPersen > 0 ? "+" : ""}
              {ringkas.trenPersen}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Tren</p>
          </CardContent>
        </Card>
      </div>

      {/* Grafik progres */}
      <Card>
        <CardHeader>
          <CardTitle>Perkembangan Nilai</CardTitle>
        </CardHeader>
        <CardContent>
          <ProgressChart items={items} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Daftar riwayat */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Riwayat Latihan</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y">
              {urut.map((it) => (
                <li key={it.id}>
                  <Link
                    href="/latihan/pembahasan"
                    className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-accent/40"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {it.judul}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {it.mapel} · {formatTanggal(it.tanggal)}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                      {it.benar}/{it.total}
                    </span>
                    <Badge variant={nilaiVariant(it.nilai)} className="shrink-0">
                      {it.nilai}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Rata-rata per mapel */}
        <Card>
          <CardHeader>
            <CardTitle>Rata-rata per Mapel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {perMapel.map((m) => (
              <div key={m.mapel}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium">{m.mapel}</span>
                  <span className="text-muted-foreground">
                    {m.rata} · {m.jumlah}×
                  </span>
                </div>
                <Progress
                  value={m.rata}
                  className="h-1.5"
                  indicatorClassName={
                    m.rata >= 80
                      ? "bg-success"
                      : m.rata >= 60
                        ? "bg-warning"
                        : "bg-destructive"
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
