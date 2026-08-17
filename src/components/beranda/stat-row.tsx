import { Card, CardContent } from "@/components/ui/card";

export interface StatItem {
  label: string;
  value: string;
}

/** Baris statistik ringkas yang dipakai dashboard guru & admin. */
export function StatRow({ items }: { items: StatItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((s) => (
        <Card key={s.label}>
          <CardContent className="p-4">
            <p className="text-2xl font-bold leading-none tabular-nums">
              {s.value}
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">{s.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
