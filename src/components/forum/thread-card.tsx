import Link from "next/link";
import { MessageSquare, Eye, Pin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { ForumThread } from "@/lib/mock/forum";

const roleBadge: Record<string, string> = {
  siswa: "Siswa",
  guru: "Guru",
  admin: "Admin",
};

const jenjangVariant = { SD: "sd", SMP: "smp", SMA: "sma" } as const;

export function ThreadCard({ thread }: { thread: ForumThread }) {
  return (
    <Link
      href={`/forum/${thread.id}`}
      className="block border-b px-5 py-4 transition-colors last:border-b-0 hover:bg-accent/40 focus-visible:outline-none focus-visible:bg-accent/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {thread.disematkan && (
              <Pin className="h-3.5 w-3.5 text-primary" aria-label="Disematkan" />
            )}
            <Badge variant="secondary" className="text-[10px]">
              {thread.kategori}
            </Badge>
            {thread.jenjang && (
              <Badge
                variant={jenjangVariant[thread.jenjang]}
                className="text-[10px]"
              >
                {thread.jenjang}
              </Badge>
            )}
          </div>
          <p className="mt-1.5 truncate font-medium leading-snug">
            {thread.judul}
          </p>
          <p className="truncate text-sm text-muted-foreground">
            {thread.cuplikan}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            oleh {thread.penulis}
            <span className="text-muted-foreground/70">
              {" "}
              · {roleBadge[thread.penulisRole]} · {thread.timeAgo}
            </span>
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            {thread.balasan}
          </span>
          <span className="inline-flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {thread.dilihat}
          </span>
        </div>
      </div>
    </Link>
  );
}
