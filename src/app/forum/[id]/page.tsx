import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye, MessageSquare, Pin } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ReplyBox } from "@/components/forum/reply-box";
import { getThread, getThreadBody, getReplies } from "@/lib/mock/forum";

const roleLabel: Record<string, string> = {
  siswa: "Siswa",
  guru: "Guru",
  admin: "Admin",
};
const jenjangVariant = { SD: "sd", SMP: "smp", SMA: "sma" } as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const t = getThread(id);
  return { title: t ? t.judul : "Diskusi tidak ditemukan" };
}

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const thread = getThread(id);
  if (!thread) notFound();

  const isi = getThreadBody(thread);
  const replies = getReplies(thread.id);

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/forum">
            <ArrowLeft className="h-4 w-4" />
            Forum
          </Link>
        </Button>

        <Card>
          <CardContent className="space-y-3 p-5">
            <div className="flex flex-wrap items-center gap-1.5">
              {thread.disematkan && (
                <Pin className="h-4 w-4 text-primary" aria-label="Disematkan" />
              )}
              <Badge variant="secondary">{thread.kategori}</Badge>
              {thread.jenjang && (
                <Badge variant={jenjangVariant[thread.jenjang]}>
                  {thread.jenjang}
                </Badge>
              )}
            </div>
            <h1 className="text-xl font-bold leading-tight">{thread.judul}</h1>
            <p className="text-xs text-muted-foreground">
              oleh {thread.penulis} · {roleLabel[thread.penulisRole]} ·{" "}
              {thread.timeAgo}
            </p>
            <p className="whitespace-pre-line text-sm leading-relaxed">{isi}</p>
            <div className="flex items-center gap-4 border-t pt-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                {thread.balasan} balasan
              </span>
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {thread.dilihat} dilihat
              </span>
            </div>
          </CardContent>
        </Card>

        <ReplyBox awal={replies} />
      </div>
    </AppShell>
  );
}
