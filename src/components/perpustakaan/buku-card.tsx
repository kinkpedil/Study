import Link from "next/link";
import { BookOpen } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Buku } from "@/lib/mock/perpustakaan";

const jenjangBadge = { SD: "sd", SMP: "smp", SMA: "sma" } as const;

// Warna sampul placeholder berdasarkan mapel (konsisten tanpa aset gambar).
const coverGradient: Record<string, string> = {
  Matematika: "from-sky-500 to-blue-600",
  IPA: "from-emerald-500 to-teal-600",
  Fisika: "from-indigo-500 to-violet-600",
  Biologi: "from-green-500 to-emerald-600",
  Kimia: "from-amber-500 to-orange-600",
  "Bahasa Indonesia": "from-rose-500 to-pink-600",
  "Bahasa Inggris": "from-fuchsia-500 to-purple-600",
};

export function BukuCard({ buku }: { buku: Buku }) {
  const gradient = coverGradient[buku.mapel] ?? "from-slate-500 to-slate-700";

  return (
    <Link
      href={`/perpustakaan/${buku.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div
        className={cn(
          "relative flex h-32 items-center justify-center bg-gradient-to-br text-primary-foreground",
          gradient,
        )}
      >
        <BookOpen className="h-8 w-8 opacity-90" />
        <Badge
          variant={jenjangBadge[buku.jenjang]}
          className="absolute right-2 top-2 bg-background/90"
        >
          {buku.jenjang}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <p className="line-clamp-2 text-sm font-semibold leading-snug">
          {buku.judul}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{buku.penulis}</p>
        <div className="mt-auto flex items-center gap-1.5 pt-3">
          <Badge variant="secondary" className="text-[10px]">
            {buku.mapel}
          </Badge>
          <span className="text-[10px] text-muted-foreground">
            {buku.kategori}
          </span>
        </div>
      </div>
    </Link>
  );
}
