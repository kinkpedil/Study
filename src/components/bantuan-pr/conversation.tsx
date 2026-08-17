"use client";

import { useState } from "react";
import { Lightbulb, ListChecks, Send, Sparkles } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Percakapan } from "@/lib/mock/percakapan";

interface FollowUp {
  id: number;
  tanya: string;
}

export function Conversation({ sesi }: { sesi: Percakapan }) {
  // Berapa banyak petunjuk yang sudah diungkap (mulai dari 1).
  const [terungkap, setTerungkap] = useState(1);
  const [tampilFinal, setTampilFinal] = useState(false);
  const [tindakLanjut, setTindakLanjut] = useState<FollowUp[]>([]);
  const [draf, setDraf] = useState("");

  const totalPetunjuk = sesi.petunjuk.length;
  const semuaTerungkap = terungkap >= totalPetunjuk;

  function kirimTindakLanjut(e: React.FormEvent) {
    e.preventDefault();
    if (draf.trim().length === 0) return;
    setTindakLanjut((prev) => [...prev, { id: prev.length, tanya: draf }]);
    setDraf("");
    // AI belum tersedia — beri satu petunjuk berikutnya bila masih ada.
    if (!semuaTerungkap) setTerungkap((n) => Math.min(totalPetunjuk, n + 1));
  }

  return (
    <div className="space-y-4">
      {/* Pertanyaan siswa */}
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-sm text-primary-foreground">
          {sesi.pertanyaan}
        </div>
      </div>

      {/* Petunjuk bertahap */}
      {sesi.petunjuk.slice(0, terungkap).map((teks, i) => (
        <div key={i} className="flex justify-start">
          <div className="max-w-[85%] space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
              <Lightbulb className="h-3.5 w-3.5" />
              Petunjuk {i + 1} dari {totalPetunjuk}
            </div>
            <div className="rounded-2xl rounded-tl-sm border bg-card px-4 py-3 text-sm">
              {teks}
            </div>
          </div>
        </div>
      ))}

      {/* Tindak lanjut pengguna + petunjuk lanjutan mock */}
      {tindakLanjut.map((f) => (
        <div key={f.id} className="flex justify-end">
          <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-sm text-primary-foreground">
            {f.tanya}
          </div>
        </div>
      ))}

      {/* Langkah penyelesaian akhir */}
      {tampilFinal && (
        <div className="flex justify-start">
          <div className="max-w-[85%] space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-success">
              <ListChecks className="h-3.5 w-3.5" />
              Langkah penyelesaian
            </div>
            <ol className="space-y-2 rounded-2xl rounded-tl-sm border border-success/40 bg-success/10 px-4 py-3 text-sm">
              {sesi.langkahFinal.map((l, i) => (
                <li key={i} className="flex gap-2">
                  <span className="font-semibold text-success">{i + 1}.</span>
                  <span>{l}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* Kontrol pengungkapan */}
      <div className="flex flex-wrap gap-2">
        {!semuaTerungkap && (
          <Button
            variant="outline"
            onClick={() => setTerungkap((n) => Math.min(totalPetunjuk, n + 1))}
          >
            <Lightbulb className="h-4 w-4" />
            Petunjuk berikutnya
          </Button>
        )}
        {semuaTerungkap && !tampilFinal && (
          <Button variant="outline" onClick={() => setTampilFinal(true)}>
            <ListChecks className="h-4 w-4" />
            Tampilkan langkah penyelesaian
          </Button>
        )}
      </div>

      {/* Komposer tindak lanjut */}
      <Card>
        <CardContent className="p-3">
          <form onSubmit={kirimTindakLanjut} className="space-y-2">
            <Textarea
              value={draf}
              onChange={(e) => setDraf(e.target.value)}
              placeholder="Masih bingung? Tanyakan bagian yang belum jelas…"
              className="min-h-16 border-0 shadow-none focus-visible:ring-0"
            />
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3" />
                Bahasa sesuai jenjang {sesi.jenjang}
              </Badge>
              <Button type="submit" size="sm" disabled={draf.trim().length === 0}>
                <Send className="h-4 w-4" />
                Kirim
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <p className={cn("text-center text-xs text-muted-foreground")}>
        Bantuan PR memberi petunjuk agar kamu paham caranya — bukan jawaban
        instan.
      </p>
    </div>
  );
}
