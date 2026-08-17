import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { TugasForm } from "@/components/tugas/tugas-form";

export const metadata: Metadata = {
  title: "Buat Tugas",
};

export default function BuatTugasPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
          <Link href="/tugas">
            <ArrowLeft className="h-4 w-4" />
            Tugas
          </Link>
        </Button>
        <TugasForm />
      </div>
    </AppShell>
  );
}
