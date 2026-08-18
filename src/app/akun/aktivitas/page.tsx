import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { AuditView } from "@/components/akun/audit-view";

export const metadata: Metadata = {
  title: "Catatan Aktivitas",
};

export default function AktivitasPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
          <Link href="/akun">
            <ArrowLeft className="h-4 w-4" />
            Akun
          </Link>
        </Button>
        <PageHeader
          title="Catatan Aktivitas"
          description="Riwayat tindakan penting di sekolah untuk akuntabilitas dan keamanan."
        />
        <AuditView />
      </div>
    </AppShell>
  );
}
