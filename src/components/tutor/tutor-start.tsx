"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Sparkles } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { useRole } from "@/components/role/role-context";
import { mapelTutor, topikCepat } from "@/lib/mock/tutor";

/** Komposer memulai sesi tutor: pilih mapel + tulis topik, lalu mulai. */
export function TutorStart() {
  const router = useRouter();
  const { profile } = useRole();
  const [mapel, setMapel] = useState(mapelTutor[0]);
  const [topik, setTopik] = useState("");

  function mulai(e: React.FormEvent) {
    e.preventDefault();
    if (topik.trim().length === 0) return;
    // Sesi baru (mock): id lokal + bawa topik lewat query.
    const id = `baru-${Date.now().toString(36)}`;
    const params = new URLSearchParams({ mapel, topik: topik.trim() });
    router.push(`/tutor/${id}?${params.toString()}`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Mulai Belajar dengan Tutor AI
        </CardTitle>
        <CardDescription>
          Tanya apa saja — tutor akan menjelaskan sesuai jenjang{" "}
          {profile.jenjang ?? "kamu"} dengan cara yang aman dan mudah dipahami.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={mulai} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[200px_1fr] sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="mapel-tutor">Mata pelajaran</Label>
              <Select
                id="mapel-tutor"
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
              <Label htmlFor="topik-tutor">Apa yang ingin kamu pelajari?</Label>
              <Input
                id="topik-tutor"
                value={topik}
                onChange={(e) => setTopik(e.target.value)}
                placeholder="mis. Bantu aku memahami pecahan senilai"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {topikCepat.map((t) => (
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

          <div className="flex justify-end border-t pt-4">
            <Button type="submit" disabled={topik.trim().length === 0}>
              <Send className="h-4 w-4" />
              Mulai Sesi
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
