"use client";

import { useState } from "react";
import { Lightbulb, Send } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useRole } from "@/components/role/role-context";
import { mapelBantuan, contohPertanyaan } from "@/lib/mock/bantuan-pr";
import { PhotoUpload } from "./photo-upload";

export function Composer() {
  const { profile } = useRole();
  const [pertanyaan, setPertanyaan] = useState("");
  const [mapel, setMapel] = useState(mapelBantuan[0]);
  const [foto, setFoto] = useState<File | null>(null);
  const [terkirim, setTerkirim] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pertanyaan.trim().length === 0) return;
    // Backend AI belum tersedia — tampilkan konfirmasi terkirim (mock).
    setTerkirim(true);
  }

  if (terkirim) {
    return (
      <Card>
        <CardContent className="space-y-4 py-8">
          <div className="flex items-center gap-2 text-primary">
            <Lightbulb className="h-5 w-5" />
            <span className="font-semibold">Pertanyaanmu terkirim</span>
          </div>
          <div className="rounded-lg border bg-muted/30 p-4">
            <Badge variant="secondary" className="mb-2">
              {mapel}
            </Badge>
            <p className="text-sm">{pertanyaan}</p>
            {foto && (
              <p className="mt-2 text-xs text-muted-foreground">
                Lampiran: {foto.name}
              </p>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            AI akan memberi <strong>petunjuk bertahap</strong> — bukan jawaban
            instan — dengan bahasa yang sesuai jenjang{" "}
            {profile.jenjang ?? "kamu"}. (Petunjuk akan tampil di sini setelah
            layanan AI aktif.)
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setTerkirim(false);
              setPertanyaan("");
              setFoto(null);
            }}
          >
            Tanya lagi
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kirim Pertanyaan</CardTitle>
        <CardDescription>
          Ketik soal atau unggah foto soal. Kamu akan dapat petunjuk langkah
          demi langkah, bukan langsung jawaban.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="mapel-pr">Mata Pelajaran</Label>
              <Select
                id="mapel-pr"
                value={mapel}
                onChange={(e) => setMapel(e.target.value)}
              >
                {mapelBantuan.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pertanyaan">Pertanyaan</Label>
            <Textarea
              id="pertanyaan"
              value={pertanyaan}
              onChange={(e) => setPertanyaan(e.target.value)}
              placeholder="Contoh: Bagaimana cara menyederhanakan pecahan (x²−4)/(x+2)?"
              className="min-h-32"
            />
          </div>

          {/* Lampiran foto soal dengan pratinjau & hapus. */}
          <PhotoUpload value={foto} onChange={setFoto} />

          {/* Contoh pertanyaan */}
          <div className="flex flex-wrap gap-2">
            {contohPertanyaan.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setPertanyaan(c)}
                className="rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent"
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex justify-end border-t pt-4">
            <Button type="submit" disabled={pertanyaan.trim().length === 0}>
              <Send className="h-4 w-4" />
              Minta Petunjuk
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
