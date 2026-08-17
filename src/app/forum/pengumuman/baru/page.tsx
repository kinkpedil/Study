import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { PengumumanForm } from "@/components/forum/pengumuman-form";

export const metadata: Metadata = {
  title: "Buat Pengumuman",
};

export default function BuatPengumumanPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
          <Link href="/forum">
            <ArrowLeft className="h-4 w-4" />
            Forum
          </Link>
        </Button>
        <PengumumanForm />
      </div>
    </AppShell>
  );
}
