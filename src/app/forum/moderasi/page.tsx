import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ModerasiView } from "@/components/forum/moderasi-view";

export const metadata: Metadata = {
  title: "Moderasi Forum",
};

export default function ModerasiPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
          <Link href="/forum">
            <ArrowLeft className="h-4 w-4" />
            Forum
          </Link>
        </Button>
        <PageHeader
          title="Moderasi Forum"
          description="Tinjau laporan konten yang ditandai AI atau dilaporkan pengguna."
        />
        <ModerasiView />
      </div>
    </AppShell>
  );
}
