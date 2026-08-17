import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { RiwayatList } from "@/components/bantuan-pr/riwayat-list";

export const metadata: Metadata = {
  title: "Riwayat Bantuan PR",
};

export default function RiwayatBantuanPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
          <Link href="/bantuan-pr">
            <ArrowLeft className="h-4 w-4" />
            Bantuan PR
          </Link>
        </Button>
        <PageHeader
          title="Riwayat Bantuan"
          description="Buka kembali percakapan bantuan PR-mu kapan saja."
        />
        <RiwayatList />
      </div>
    </AppShell>
  );
}
