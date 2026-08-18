import Link from "next/link";
import { GraduationCap } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { tutorSessions } from "@/lib/mock/tutor";

export function TutorSessions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sesi Terakhir</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {tutorSessions.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            Belum ada sesi. Mulai belajar di atas!
          </p>
        ) : (
          <ul className="divide-y">
            {tutorSessions.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/tutor/${s.id}`}
                  className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-accent/40"
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <GraduationCap className="h-4 w-4" />
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
                        {s.jumlahPesan} pesan · {s.timeAgo}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
