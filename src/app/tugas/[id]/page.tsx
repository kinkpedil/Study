import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SiswaSubmission } from "@/components/tugas/siswa-submission";
import {
  getTugasSiswa,
  getTugasGuru,
  sisaTenggat,
  formatTanggal,
} from "@/lib/mock/tugas";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const t = getTugasSiswa(id) ?? getTugasGuru(id);
  return { title: t ? t.judul : "Tugas tidak ditemukan" };
}

export default async function TugasDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const siswa = getTugasSiswa(id);
  const guru = getTugasGuru(id);
  if (!siswa && !guru) notFound();

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
          <Link href="/tugas">
            <ArrowLeft className="h-4 w-4" />
            Tugas
          </Link>
        </Button>

        {siswa ? (
          <SiswaSubmission tugas={siswa} />
        ) : guru ? (
          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="secondary" className="text-[10px]">
                  {guru.mapel}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  Kelas {guru.kelas}
                </Badge>
              </div>
              <h1 className="text-xl font-bold leading-tight">{guru.judul}</h1>
              <p className="text-xs text-muted-foreground">
                Tenggat {formatTanggal(guru.tenggat)} ·{" "}
                {sisaTenggat(guru.tenggat).teks}
              </p>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {guru.terkumpul}/{guru.jumlahSiswa} terkumpul
                  </span>
                  <span>{guru.perluDinilai} perlu dinilai</span>
                </div>
                <Progress
                  value={Math.round(
                    (guru.terkumpul / guru.jumlahSiswa) * 100,
                  )}
                  className="h-1.5"
                />
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </AppShell>
  );
}
