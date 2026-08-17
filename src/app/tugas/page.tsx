import type { Metadata } from "next";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { TugasView } from "@/components/tugas/tugas-view";

export const metadata: Metadata = {
  title: "Tugas & Penilaian",
};

export default function TugasPage() {
  return (
    <AppShell>
      <PageHeader
        title="Tugas & Penilaian"
        description="Pantau tenggat, kumpulkan tugas, dan lihat nilai dalam satu tempat."
      />
      <TugasView />
    </AppShell>
  );
}
