import type { Metadata } from "next";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { RiwayatView } from "@/components/latihan/riwayat-view";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Rekap Nilai & Riwayat",
};

export default function RiwayatPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl">
        <PageHeader
          title="Rekap Nilai & Riwayat"
          description="Perkembangan nilai latihanmu dari waktu ke waktu."
          action={
            <Button asChild>
              <Link href="/latihan/baru">Buat latihan baru</Link>
            </Button>
          }
        />
        <RiwayatView />
      </div>
    </AppShell>
  );
}
