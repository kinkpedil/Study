import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { NewThreadForm } from "@/components/forum/new-thread-form";

export const metadata: Metadata = {
  title: "Buat Diskusi",
};

export default function BuatDiskusiPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
          <Link href="/forum">
            <ArrowLeft className="h-4 w-4" />
            Forum
          </Link>
        </Button>
        <NewThreadForm />
      </div>
    </AppShell>
  );
}
