import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TutorChat } from "@/components/tutor/tutor-chat";
import {
  getTutorSession,
  getTutorMessages,
  balasanTutorMock,
  type TutorMessage,
} from "@/lib/mock/tutor";

type SP = { [k: string]: string | string[] | undefined };

function str(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const s = getTutorSession(id);
  return { title: s ? s.judul : "Sesi Tutor AI" };
}

export default async function TutorSessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SP>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const sesi = getTutorSession(id);

  const mapel = sesi?.mapel ?? str(sp.mapel) ?? "Umum";
  const judul = sesi?.judul ?? str(sp.topik) ?? "Sesi Belajar";

  // Sesi lama: transkrip mock. Sesi baru dari komposer: mulai dari topik.
  let pesanAwal: TutorMessage[] = getTutorMessages(id);
  if (pesanAwal.length === 0) {
    const topik = str(sp.topik);
    pesanAwal = topik
      ? [
          { id: "m0", sender: "siswa", isi: topik },
          { id: "m1", sender: "ai", isi: balasanTutorMock(topik) },
        ]
      : [
          {
            id: "m0",
            sender: "ai",
            isi: "Halo! Aku tutor AI-mu. Mau belajar apa hari ini? Tanyakan saja, nanti kita bahas pelan-pelan.",
          },
        ];
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
          <Link href="/tutor">
            <ArrowLeft className="h-4 w-4" />
            Tutor AI
          </Link>
        </Button>
        <PageHeader
          title={judul}
          action={<Badge variant="secondary">{mapel}</Badge>}
        />
        <TutorChat mapel={mapel} pesanAwal={pesanAwal} />
      </div>
    </AppShell>
  );
}
