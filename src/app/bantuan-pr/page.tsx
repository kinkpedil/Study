import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Composer } from "@/components/bantuan-pr/composer";
import { RiwayatBantuan } from "@/components/bantuan-pr/riwayat-bantuan";

export const metadata: Metadata = {
  title: "Bantuan PR",
};

export default function BantuanPrPage() {
  return (
    <AppShell>
      <PageHeader
        title="Bantuan PR"
        description="Dapatkan petunjuk bertahap untuk memahami soal — bukan sekadar jawaban."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Composer />

          <div className="flex items-start gap-3 rounded-xl border bg-accent/30 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium">Belajar, bukan menyontek</p>
              <p className="text-sm text-muted-foreground">
                Bantuan PR memberi petunjuk langkah demi langkah dengan bahasa
                sesuai usia, supaya kamu paham caranya, bukan cuma hasilnya.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <RiwayatBantuan />
        </div>
      </div>
    </AppShell>
  );
}
