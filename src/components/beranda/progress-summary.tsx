import Link from "next/link";
import {
  Flame,
  Clock,
  ListChecks,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { progressSummary, type ProgressStat } from "@/lib/mock/beranda";

const stats = [
  { label: "Soal minggu ini", key: "soalDikerjakan" as const, icon: ListChecks, suffix: "" },
  { label: "Menit belajar", key: "menitBelajar" as const, icon: Clock, suffix: "" },
  { label: "Rata-rata nilai", key: "rataRataNilai" as const, icon: TrendingUp, suffix: "" },
  { label: "Streak", key: "streakHari" as const, icon: Flame, suffix: " hari" },
];

function Delta({ value }: { value: number }) {
  if (value === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-muted-foreground">
        <Minus className="h-3 w-3" /> tetap
      </span>
    );
  }
  const positive = value > 0;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[11px] font-medium",
        positive ? "text-success" : "text-destructive",
      )}
    >
      <Icon className="h-3 w-3" />
      {positive ? "+" : ""}
      {value}
    </span>
  );
}

export function ProgressSummary() {
  const { mingguIni, targetMingguan, penguasaanMapel } = progressSummary;
  const targetPersen = Math.round(
    (targetMingguan.tercapai / targetMingguan.total) * 100,
  );

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Ringkasan Progres</CardTitle>
        <Button asChild variant="ghost" size="sm" className="text-primary">
          <Link href="/latihan/riwayat">Detail</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const data: ProgressStat = mingguIni[stat.key];
            return (
              <div key={stat.key} className="rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center justify-between">
                  <Icon className="h-4 w-4 text-primary" />
                  <Delta value={data.delta} />
                </div>
                <p className="mt-2 text-xl font-bold leading-none tabular-nums">
                  {data.nilai}
                  {stat.suffix}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-medium">Target mingguan</span>
            <span className="text-muted-foreground">
              {targetMingguan.tercapai}/{targetMingguan.total} hari
            </span>
          </div>
          <Progress value={targetPersen} />
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium">Penguasaan mata pelajaran</p>
          {penguasaanMapel.map((m) => (
            <div key={m.mapel}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span>{m.mapel}</span>
                <span className="text-muted-foreground">{m.persen}%</span>
              </div>
              <Progress
                value={m.persen}
                className="h-1.5"
                indicatorClassName={
                  m.persen >= 75
                    ? "bg-success"
                    : m.persen >= 50
                      ? "bg-warning"
                      : "bg-destructive"
                }
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
