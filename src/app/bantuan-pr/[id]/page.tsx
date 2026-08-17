import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Conversation } from "@/components/bantuan-pr/conversation";
import { getPercakapan } from "@/lib/mock/percakapan";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: getPercakapan(id).judul };
}

export default async function PercakapanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sesi = getPercakapan(id);

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
          <Link href="/bantuan-pr">
            <ArrowLeft className="h-4 w-4" />
            Bantuan PR
          </Link>
        </Button>

        <PageHeader
          title={sesi.judul}
          action={<Badge variant="secondary">{sesi.mapel}</Badge>}
        />

        <Conversation sesi={sesi} />
      </div>
    </AppShell>
  );
}
