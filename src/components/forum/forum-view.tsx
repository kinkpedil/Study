"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PlusCircle, ShieldCheck, Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRole } from "@/components/role/role-context";
import {
  forumThreads,
  kategoriForum,
  scopeLabel,
  type ForumScope,
} from "@/lib/mock/forum";
import { ThreadCard } from "./thread-card";
import { SchoolForumView } from "./school-forum-view";

const scopes: ForumScope[] = ["jenjang", "umum", "sekolah"];
type Urut = "terbaru" | "populer";

export function ForumView() {
  const { profile } = useRole();
  const [scope, setScope] = useState<ForumScope>(
    profile.jenjang ? "jenjang" : "umum",
  );
  const [kategori, setKategori] = useState("Semua");
  const [urut, setUrut] = useState<Urut>("terbaru");

  const threads = useMemo(() => {
    const list = forumThreads.filter((t) => {
      if (t.scope !== scope) return false;
      // Diskusi antarjenjang: siswa hanya melihat jenjangnya sendiri.
      if (scope === "jenjang" && profile.jenjang && t.jenjang !== profile.jenjang)
        return false;
      if (kategori !== "Semua" && t.kategori !== kategori) return false;
      return true;
    });

    return [...list].sort((a, b) => {
      // Yang disematkan selalu di atas.
      const pin = Number(b.disematkan ?? false) - Number(a.disematkan ?? false);
      if (pin !== 0) return pin;
      if (urut === "populer") return b.balasan - a.balasan;
      return 0; // urutan mock dianggap terbaru-dulu
    });
  }, [scope, profile.jenjang, kategori, urut]);

  function pilihScope(s: ForumScope) {
    setScope(s);
    setKategori("Semua");
  }

  const moderator = profile.role === "guru" || profile.role === "admin";

  return (
    <div className="space-y-4">
      {moderator && (
        <div className="flex justify-end">
          <Button asChild variant="outline" size="sm">
            <Link href="/forum/moderasi">
              <ShieldCheck className="h-4 w-4" />
              Moderasi
            </Link>
          </Button>
        </div>
      )}

      {/* Tab scope */}
      <div className="flex flex-wrap gap-1.5">
        {scopes.map((s) => {
          const disabled = s === "jenjang" && !profile.jenjang;
          return (
            <button
              key={s}
              type="button"
              disabled={disabled}
              onClick={() => pilihScope(s)}
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

      {/* Banner aturan antarjenjang */}
      {scope === "jenjang" && profile.jenjang && (
        <div className="flex items-start gap-3 rounded-xl border bg-accent/30 p-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            Kamu berada di ruang <strong>{profile.jenjang}</strong>. Diskusi di
            sini hanya terlihat oleh siswa {profile.jenjang} — siswa jenjang lain
            punya ruangnya sendiri.
          </p>
        </div>
      )}
      {scope === "umum" && (
        <div className="flex items-start gap-3 rounded-xl border bg-accent/30 p-3">
          <Globe className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            Forum terbuka lintas jenjang: siswa SD, SMP, SMA, dan guru bisa
            berdiskusi bersama. Label jenjang di tiap topik menandai asal
            penulisnya.
          </p>
        </div>
      )}
      {/* Forum sekolah punya tampilan tersendiri (pengumuman, pengaduan). */}
      {scope === "sekolah" && <SchoolForumView />}

      {scope !== "sekolah" && (
        <>
      {/* Filter kategori + urutan */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {["Semua", ...kategoriForum].map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKategori(k)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                kategori === k
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-input text-muted-foreground hover:bg-accent",
              )}
            >
              {k}
            </button>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-lg border bg-background p-1 text-xs">
          {(["terbaru", "populer"] as Urut[]).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUrut(u)}
              className={cn(
                "rounded-md px-2.5 py-1 font-medium capitalize transition-colors",
                urut === u
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent",
              )}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

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
        </>
      )}
    </div>
  );
}
