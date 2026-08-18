"use client";

import { useEffect, useRef, useState } from "react";
import { GraduationCap, Send, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRole } from "@/components/role/role-context";
import {
  balasanTutorMock,
  deteksiTopikBerisiko,
  type TopikBerisiko,
  type TutorMessage,
} from "@/lib/mock/tutor";
import { PeringatanTopik } from "./peringatan-topik";

type PesanChat = TutorMessage & { peringatan?: TopikBerisiko };

export function TutorChat({
  mapel,
  pesanAwal,
}: {
  mapel: string;
  pesanAwal: TutorMessage[];
}) {
  const { profile } = useRole();
  const [pesan, setPesan] = useState<PesanChat[]>(pesanAwal);
  const [draf, setDraf] = useState("");
  const [mengetik, setMengetik] = useState(false);
  const akhirRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    akhirRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [pesan, mengetik]);

  function kirim(e: React.FormEvent) {
    e.preventDefault();
    const isi = draf.trim();
    if (isi.length === 0) return;
    const idBaru = `u-${pesan.length}`;
    setPesan((prev) => [...prev, { id: idBaru, sender: "siswa", isi }]);
    setDraf("");

    // Topik berisiko: tutor tidak menjawab biasa, tampilkan peringatan aman.
    // Deteksi asli oleh moderasi AI di server; ini pratinjau sisi klien.
    const risiko = deteksiTopikBerisiko(isi);
    if (risiko) {
      setPesan((prev) => [
        ...prev,
        {
          id: `w-${prev.length}`,
          sender: "ai",
          isi: risiko.pesan,
          peringatan: risiko,
        },
      ]);
      return;
    }

    setMengetik(true);
    // Balasan tutor tiruan (AI asli disambung di backend).
    window.setTimeout(() => {
      setPesan((prev) => [
        ...prev,
        { id: `a-${prev.length}`, sender: "ai", isi: balasanTutorMock(isi) },
      ]);
      setMengetik(false);
    }, 700);
  }

  return (
    <div className="flex h-[70vh] flex-col rounded-xl border bg-card">
      {/* Pesan */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {pesan.map((m) =>
          m.peringatan ? (
            <PeringatanTopik key={m.id} info={m.peringatan} />
          ) : m.sender === "siswa" ? (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                {m.isi}
              </div>
            </div>
          ) : (
            <div key={m.id} className="flex items-start gap-2">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <GraduationCap className="h-4 w-4" />
              </span>
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm border bg-background px-4 py-2.5 text-sm">
                {m.isi}
              </div>
            </div>
          ),
        )}
        {mengetik && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
              <GraduationCap className="h-4 w-4" />
            </span>
            Tutor sedang mengetik…
          </div>
        )}
        <div ref={akhirRef} />
      </div>

      {/* Komposer */}
      <form onSubmit={kirim} className="border-t p-3">
        <div className="mb-2 flex items-center justify-between">
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" />
            {mapel} · jenjang {profile.jenjang ?? "kamu"}
          </Badge>
        </div>
        <div className="flex items-end gap-2">
          <Textarea
            value={draf}
            onChange={(e) => setDraf(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                kirim(e);
              }
            }}
            placeholder="Tanyakan apa saja ke tutor…"
            className={cn("min-h-11 flex-1 resize-none")}
          />
          <Button type="submit" size="icon" disabled={draf.trim().length === 0}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
