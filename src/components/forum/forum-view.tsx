"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRole } from "@/components/role/role-context";
import {
  forumThreads,
  scopeLabel,
  scopeDeskripsi,
  type ForumScope,
} from "@/lib/mock/forum";
import { ThreadCard } from "./thread-card";

const scopes: ForumScope[] = ["jenjang", "umum", "sekolah"];

export function ForumView() {
  const { profile } = useRole();
  const [scope, setScope] = useState<ForumScope>(
    profile.jenjang ? "jenjang" : "umum",
  );

  const threads = useMemo(() => {
    const list = forumThreads.filter((t) => {
      if (t.scope !== scope) return false;
      // Diskusi antarjenjang: siswa hanya melihat jenjangnya sendiri.
      if (scope === "jenjang" && profile.jenjang) {
        return t.jenjang === profile.jenjang;
      }
      return true;
    });
    // Yang disematkan tampil dulu.
    return [...list].sort(
      (a, b) => Number(b.disematkan ?? false) - Number(a.disematkan ?? false),
    );
  }, [scope, profile.jenjang]);

  return (
    <div className="space-y-4">
      {/* Tab scope */}
      <div className="flex flex-wrap gap-1.5">
        {scopes.map((s) => {
          const disabled = s === "jenjang" && !profile.jenjang;
          return (
            <button
              key={s}
              type="button"
              disabled={disabled}
              onClick={() => setScope(s)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                scope === s
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-input text-muted-foreground hover:bg-accent",
              )}
            >
              {scopeLabel[s]}
              {s === "jenjang" && profile.jenjang ? ` (${profile.jenjang})` : ""}
            </button>
          );
        })}
      </div>

      <p className="text-sm text-muted-foreground">{scopeDeskripsi[scope]}</p>

      <div className="flex justify-end">
        <Button asChild>
          <Link href="/forum/baru">
            <PlusCircle className="h-4 w-4" />
            Buat Diskusi
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {threads.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Belum ada diskusi di ruang ini. Jadilah yang pertama!
            </p>
          ) : (
            threads.map((t) => <ThreadCard key={t.id} thread={t} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
