import type { Metadata } from "next";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { BukuGrid } from "@/components/perpustakaan/buku-grid";

export const metadata: Metadata = {
  title: "Perpustakaan Digital",
};

export default function PerpustakaanPage() {
  return (
    <AppShell>
      <PageHeader
        title="Perpustakaan Digital"
        description="Temukan buku dari sumber resmi Kemendikbud — metadata & tautan asli, bukan salinan."
      />
      <BukuGrid />
    </AppShell>
  );
}
