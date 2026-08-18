import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EskalasiView } from "@/components/tutor/eskalasi-view";

export const metadata: Metadata = {
  title: "Eskalasi Tutor AI",
};

export default function EskalasiPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
          <Link href="/tutor">
            <ArrowLeft className="h-4 w-4" />
            Tutor AI
          </Link>
        </Button>
        <PageHeader
          title="Permintaan Bantuan Siswa"
          description="Sesi tutor AI yang diteruskan siswa untuk kamu bantu."
        />
        <EskalasiView />
      </div>
    </AppShell>
  );
}
