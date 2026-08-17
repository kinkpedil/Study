import { Flame, Clock, ListChecks, TrendingUp } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { progressSummary } from "@/lib/mock/beranda";

const stats = [
  {
    label: "Soal minggu ini",
    key: "soalDikerjakan" as const,
    icon: ListChecks,
    suffix: "",
  },
  {
    label: "Menit belajar",
    key: "menitBelajar" as const,
    icon: Clock,
    suffix: "",
  },
  {
    label: "Rata-rata nilai",
    key: "rataRataNilai" as const,
    icon: TrendingUp,
    suffix: "",
  },
  {
    label: "Streak",
    key: "streakHari" as const,
    icon: Flame,
    suffix: " hari",
  },
];

export function ProgressSummary() {
  const { mingguIni, targetMingguan, penguasaanMapel } = progressSummary;
  const targetPersen = Math.round(
    (targetMingguan.tercapai / targetMingguan.total) * 100,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ringkasan Progres</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.key}
                className="rounded-lg border bg-muted/30 p-3"
              >
                <Icon className="h-4 w-4 text-primary" />
                <p className="mt-2 text-xl font-bold leading-none">
                  {mingguIni[stat.key]}
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
