import type { Metadata } from "next";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { ParameterForm } from "@/components/latihan/parameter-form";

export const metadata: Metadata = {
  title: "Buat Latihan Soal",
};

export default function BuatLatihanPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <PageHeader
          title="Buat Latihan Soal"
          description="Susun latihan berbantuan AI sesuai kebutuhan belajarmu."
        />
        <ParameterForm />
      </div>
    </AppShell>
  );
}
