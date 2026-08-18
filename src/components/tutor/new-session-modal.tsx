"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Send } from "lucide-react";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { mapelTutor, topikCepat } from "@/lib/mock/tutor";

/** Modal untuk memulai sesi tutor baru dari mana saja. */
export function NewSessionModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mapel, setMapel] = useState(mapelTutor[0]);
  const [topik, setTopik] = useState("");

  function mulai(e: React.FormEvent) {
    e.preventDefault();
    if (topik.trim().length === 0) return;
    const id = `baru-${Date.now().toString(36)}`;
    const params = new URLSearchParams({ mapel, topik: topik.trim() });
    setOpen(false);
    router.push(`/tutor/${id}?${params.toString()}`);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="h-4 w-4" />
          Sesi Baru
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mulai Sesi Baru</DialogTitle>
          <DialogDescription>
            Pilih mata pelajaran dan tulis apa yang ingin kamu pelajari.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={mulai} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="modal-mapel">Mata pelajaran</Label>
            <Select
              id="modal-mapel"
              value={mapel}
              onChange={(e) => setMapel(e.target.value)}
            >
              {mapelTutor.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="modal-topik">Topik / pertanyaan</Label>
            <Input
              id="modal-topik"
              value={topik}
              onChange={(e) => setTopik(e.target.value)}
              placeholder="mis. Jelaskan siklus air"
              autoFocus
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {topikCepat.slice(0, 3).map((t) => (
              <button
                key={t.topik}
                type="button"
                onClick={() => {
                  setMapel(t.mapel);
                  setTopik(t.topik);
                }}
                className="rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent"
              >
                {t.topik}
              </button>
            ))}
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={topik.trim().length === 0}>
              <Send className="h-4 w-4" />
              Mulai
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
