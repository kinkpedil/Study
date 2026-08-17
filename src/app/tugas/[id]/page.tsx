import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { SiswaSubmission } from "@/components/tugas/siswa-submission";
import { GuruGrading } from "@/components/tugas/guru-grading";
import {
  getTugasSiswa,
  getTugasGuru,
  getPengumpulan,
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
          <GuruGrading tugas={guru} pengumpulan={getPengumpulan(guru.id)} />
        ) : null}
      </div>
    </AppShell>
  );
}
