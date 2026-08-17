import Link from "next/link";
import { MessageCircleQuestion } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { riwayatBantuan } from "@/lib/mock/bantuan-pr";

export function RiwayatBantuan() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Riwayat Bantuan</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y">
          {riwayatBantuan.map((s) => (
            <li key={s.id}>
              <Link
                href={`/bantuan-pr/${s.id}`}
                className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-accent/40"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MessageCircleQuestion className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{s.judul}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {s.cuplikan}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {s.mapel}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">
                      {s.jumlahPetunjuk} petunjuk · {s.timeAgo}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
