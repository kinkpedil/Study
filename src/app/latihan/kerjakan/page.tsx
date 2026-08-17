import type { Metadata } from "next";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { KerjakanSoal } from "@/components/latihan/kerjakan-soal";
import { Badge } from "@/components/ui/badge";
import { contohLatihan } from "@/lib/mock/soal";

export const metadata: Metadata = {
  title: "Kerjakan Soal",
};

export default function KerjakanPage() {
  const l = contohLatihan;
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <PageHeader
          title={l.judul}
          description={`${l.mapel} · ${l.jenjang} kelas ${l.kelas}`}
          action={
            <Badge variant="secondary" className="capitalize">
              {l.kesulitan}
            </Badge>
          }
        />
        <KerjakanSoal latihan={l} />
      </div>
    </AppShell>
  );
}
