import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, ExternalLink, Info } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getBuku } from "@/lib/mock/perpustakaan";

const jenjangBadge = { SD: "sd", SMP: "smp", SMA: "sma" } as const;

const coverGradient: Record<string, string> = {
  Matematika: "from-sky-500 to-blue-600",
  IPA: "from-emerald-500 to-teal-600",
  Fisika: "from-indigo-500 to-violet-600",
  Biologi: "from-green-500 to-emerald-600",
  Kimia: "from-amber-500 to-orange-600",
  "Bahasa Indonesia": "from-rose-500 to-pink-600",
  "Bahasa Inggris": "from-fuchsia-500 to-purple-600",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const buku = getBuku(id);
  return { title: buku ? buku.judul : "Buku tidak ditemukan" };
}

export default async function DetailBukuPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const buku = getBuku(id);
  if (!buku) notFound();

  const gradient = coverGradient[buku.mapel] ?? "from-slate-500 to-slate-700";

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
          <Link href="/perpustakaan">
            <ArrowLeft className="h-4 w-4" />
            Perpustakaan
          </Link>
        </Button>

        <div className="grid gap-6 sm:grid-cols-[200px_1fr]">
          {/* Sampul */}
          <div
            className={cn(
              "flex h-56 items-center justify-center rounded-xl bg-gradient-to-br text-primary-foreground shadow-sm sm:h-64",
              gradient,
            )}
          >
            <BookOpen className="h-16 w-16 opacity-90" />
          </div>

          {/* Info utama */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              <Badge variant={jenjangBadge[buku.jenjang]}>
                {buku.jenjang}
              </Badge>
              <Badge variant="secondary">{buku.mapel}</Badge>
              <Badge variant="outline">{buku.kategori}</Badge>
            </div>
            <h1 className="text-xl font-bold leading-tight sm:text-2xl">
              {buku.judul}
            </h1>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Penulis</dt>
                <dd>{buku.penulis}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Penerbit</dt>
                <dd>{buku.penerbit}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Kelas</dt>
                <dd>Kelas {buku.kelas}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Tahun</dt>
                <dd>{buku.tahun}</dd>
              </div>
            </dl>

            <Button asChild size="lg" className="w-full sm:w-auto">
              <a
                href={buku.sumberUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
                Buka di sumber resmi
              </a>
            </Button>
          </div>
        </div>

        {/* Deskripsi */}
        <Card className="mt-6">
          <CardContent className="p-5">
            <h2 className="mb-2 text-sm font-semibold">Deskripsi</h2>
            <p className="text-sm leading-relaxed text-foreground/90">
              {buku.deskripsi}
            </p>
          </CardContent>
        </Card>

        {/* Catatan sumber */}
        <div className="mt-4 flex items-start gap-3 rounded-xl border bg-accent/30 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            Sekolah Cerdas hanya menampilkan metadata dan menautkan ke sumber
            resmi Kemendikbud. Isi buku tidak disalin — buka tautan di atas
            untuk membaca di situs aslinya.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
