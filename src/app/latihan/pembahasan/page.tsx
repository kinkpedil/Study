import type { Metadata } from "next";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Pembahasan } from "@/components/latihan/pembahasan";
import { contohLatihan } from "@/lib/mock/soal";

export const metadata: Metadata = {
  title: "Kunci & Pembahasan",
};

export default function PembahasanPage() {
  const l = contohLatihan;
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <PageHeader
          title="Kunci & Pembahasan"
          description={`${l.judul} · ${l.mapel}`}
        />
        <Pembahasan latihan={l} />
      </div>
    </AppShell>
  );
}
