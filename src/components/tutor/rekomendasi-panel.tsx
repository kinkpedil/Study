import Link from "next/link";
import {
  BookOpen,
  PencilRuler,
  Play,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { rekomendasiTutor, type RekomendasiTipe } from "@/lib/mock/tutor";

const tipeMeta: Record<RekomendasiTipe, { icon: LucideIcon; label: string }> = {
  materi: { icon: BookOpen, label: "Materi" },
  latihan: { icon: PencilRuler, label: "Latihan" },
  video: { icon: Play, label: "Video" },
};

/** Panel rekomendasi materi/latihan berdasarkan progres (data tiruan). */
export function RekomendasiPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Rekomendasi untukmu</CardTitle>
        <p className="text-xs text-muted-foreground">
          Disarankan dari nilai & progres belajarmu.
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {rekomendasiTutor.map((r) => {
          const { icon: Icon, label } = tipeMeta[r.tipe];
          return (
            <Link
              key={r.id}
              href={r.href}
              className="group flex items-start gap-3 rounded-lg border p-3 transition-colors hover:border-primary/40 hover:bg-accent/40"
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-sm font-medium">{r.judul}</p>
                  <Badge variant="secondary" className="text-[10px]">
                    {label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{r.alasan}</p>
              </div>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
