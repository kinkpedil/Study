"use client";

import { useState } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRole } from "@/components/role/role-context";
import type { ForumReply, ForumScope } from "@/lib/mock/forum";
import { ReportButton } from "./report-button";

const roleLabel: Record<string, string> = {
  siswa: "Siswa",
  guru: "Guru",
  admin: "Admin",
};

const jenjangVariant = { SD: "sd", SMP: "smp", SMA: "sma" } as const;

function initials(name: string) {
  return name
    .split(" ")
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

/** Daftar balasan + kotak balas (mock: balasan baru ditambahkan lokal). */
export function ReplyBox({
  awal,
  threadId,
  scope,
}: {
  awal: ForumReply[];
  threadId: string;
  scope: ForumScope;
}) {
  const { profile } = useRole();
  const [balasan, setBalasan] = useState<ForumReply[]>(awal);
  const [draf, setDraf] = useState("");

  // Di forum umum/sekolah, tandai jenjang penulis (lintas jenjang).
  const tampilJenjang = scope !== "jenjang";
  const jenjangSaya =
    profile.role === "guru" || profile.role === "admin"
      ? "Guru"
      : profile.jenjang;

  function kirim(e: React.FormEvent) {
    e.preventDefault();
    const isi = draf.trim();
    if (isi.length === 0) return;
    setBalasan((prev) => [
      ...prev,
      {
        id: `local_${prev.length}`,
        threadId,
        penulis: profile.name,
        penulisRole: profile.role,
        penulisJenjang: tampilJenjang ? jenjangSaya : undefined,
        isi,
        timeAgo: "baru saja",
      },
    ]);
    setDraf("");
  }

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-muted-foreground">
        {balasan.length} Balasan
      </h2>

      <ul className="space-y-3">
        {balasan.map((r) => (
          <li key={r.id} className="flex gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {initials(r.penulis)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 rounded-xl border bg-card p-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{r.penulis}</span>
                <Badge variant="secondary" className="text-[10px]">
                  {roleLabel[r.penulisRole]}
                </Badge>
                {tampilJenjang && r.penulisJenjang && (
                  <Badge
                    variant={
                      r.penulisJenjang === "Guru"
                        ? "outline"
                        : jenjangVariant[r.penulisJenjang]
                    }
                    className="text-[10px]"
                  >
                    {r.penulisJenjang}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {r.timeAgo}
                </span>
              </div>
              <p className="mt-1 text-sm">{r.isi}</p>
              <div className="mt-2 flex justify-end">
                <ReportButton target="balasan ini" />
              </div>
            </div>
          </li>
        ))}
      </ul>

      <form onSubmit={kirim} className="space-y-2 rounded-xl border p-3">
        <Textarea
          value={draf}
          onChange={(e) => setDraf(e.target.value)}
          placeholder="Tulis balasanmu dengan sopan…"
          className="min-h-20 border-0 shadow-none focus-visible:ring-0"
        />
        <div className="flex items-center justify-between">
          <Badge variant="secondary">Bahasa santun · dimoderasi</Badge>
          <Button type="submit" size="sm" disabled={draf.trim().length === 0}>
            <Send className="h-4 w-4" />
            Balas
          </Button>
        </div>
      </form>
    </div>
  );
}
