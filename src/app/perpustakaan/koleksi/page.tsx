import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { KoleksiList } from "@/components/perpustakaan/koleksi-list";

export const metadata: Metadata = {
  title: "Koleksi Tersimpan",
};

export default function KoleksiPage() {
  return (
    <AppShell>
      <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
        <Link href="/perpustakaan">
          <ArrowLeft className="h-4 w-4" />
          Perpustakaan
        </Link>
      </Button>
      <PageHeader
        title="Koleksi Tersimpan"
        description="Buku favorit yang kamu simpan, tersedia kapan saja."
      />
      <KoleksiList />
    </AppShell>
  );
}
