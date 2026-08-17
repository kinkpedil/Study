import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { recentQuizScores } from "@/lib/mock/beranda";

function scoreVariant(persen: number) {
  if (persen >= 80) return "success" as const;
  if (persen >= 60) return "warning" as const;
  return "destructive" as const;
}

export function QuizScores() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nilai Kuis Terbaru</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentQuizScores.map((q) => {
          const persen = Math.round((q.nilai / q.total) * 100);
          return (
            <div
              key={q.id}
              className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{q.judul}</p>
                <p className="text-xs text-muted-foreground">{q.mapel}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-sm font-semibold tabular-nums">
                  {q.nilai}/{q.total}
                </span>
                <Badge variant={scoreVariant(persen)}>{persen}%</Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
