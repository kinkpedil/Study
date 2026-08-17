"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

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
import { cn } from "@/lib/utils";
import type { Jenjang } from "@/lib/mock/beranda";
import {
  jenjangList,
  kelasByJenjang,
  mapelByJenjang,
  topikForMapel,
  kesulitanList,
  tipeSoalList,
  jumlahSoalOptions,
  defaultParams,
  type Kesulitan,
  type TipeSoal,
} from "@/lib/mock/latihan";

export function ParameterForm() {
  const router = useRouter();
  const [jenjang, setJenjang] = useState<Jenjang>(defaultParams.jenjang);
  const [kelas, setKelas] = useState(defaultParams.kelas);
  const [mapel, setMapel] = useState(defaultParams.mapel);
  const [topik, setTopik] = useState(defaultParams.topik);
  const [kesulitan, setKesulitan] = useState<Kesulitan>(
    defaultParams.kesulitan,
  );
  const [tipe, setTipe] = useState<TipeSoal>(defaultParams.tipe);
  const [jumlah, setJumlah] = useState(defaultParams.jumlah);

  const kelasOptions = kelasByJenjang[jenjang];
  const mapelOptions = mapelByJenjang[jenjang];
  const topikOptions = useMemo(() => topikForMapel(mapel), [mapel]);

  // Saat jenjang berubah, sesuaikan kelas & mapel bila jadi tidak valid.
  function handleJenjang(next: Jenjang) {
    setJenjang(next);
    if (!kelasByJenjang[next].includes(kelas)) {
      setKelas(kelasByJenjang[next][0]);
    }
    if (!mapelByJenjang[next].includes(mapel)) {
      const nextMapel = mapelByJenjang[next][0];
      setMapel(nextMapel);
      setTopik(topikForMapel(nextMapel)[0]);
    }
  }

  function handleMapel(next: string) {
    setMapel(next);
    setTopik(topikForMapel(next)[0]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Backend/AI belum tersedia — parameter ini nanti dikirim ke API generator.
    // Untuk sekarang, arahkan ke halaman kerjakan soal dengan set contoh.
    const params = new URLSearchParams({
      jenjang,
      kelas,
      mapel,
      topik,
      kesulitan,
      tipe,
      jumlah: String(jumlah),
    });
    router.push(`/latihan/kerjakan?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Atur Parameter Soal</CardTitle>
          <CardDescription>
            Pilih jenjang, kelas, mata pelajaran, topik, kesulitan, dan jumlah
            soal sebelum membuat latihan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Jenjang & Kelas */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Jenjang</Label>
              <div className="grid grid-cols-3 gap-2">
                {jenjangList.map((j) => (
                  <button
                    key={j}
                    type="button"
                    aria-pressed={jenjang === j}
                    onClick={() => handleJenjang(j)}
                    className={cn(
                      "rounded-md border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      jenjang === j
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-input hover:bg-accent",
                    )}
                  >
                    {j}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="kelas">Kelas</Label>
              <Select
                id="kelas"
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
              >
                {kelasOptions.map((k) => (
                  <option key={k} value={k}>
                    Kelas {k}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Mapel & Topik */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="mapel">Mata Pelajaran</Label>
              <Select
                id="mapel"
                value={mapel}
                onChange={(e) => handleMapel(e.target.value)}
              >
                {mapelOptions.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topik">Topik</Label>
              <Select
                id="topik"
                value={topik}
                onChange={(e) => setTopik(e.target.value)}
              >
                {topikOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Kesulitan */}
          <div className="space-y-2">
            <Label>Tingkat Kesulitan</Label>
            <div className="grid gap-2 sm:grid-cols-3">
              {kesulitanList.map((k) => (
                <button
                  key={k.value}
                  type="button"
                  aria-pressed={kesulitan === k.value}
                  onClick={() => setKesulitan(k.value)}
                  className={cn(
                    "rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    kesulitan === k.value
                      ? "border-primary bg-primary/10"
                      : "border-input hover:bg-accent",
                  )}
                >
                  <span className="block text-sm font-semibold">{k.label}</span>
                  <span className="block text-xs text-muted-foreground">
                    {k.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tipe & Jumlah */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tipe">Tipe Soal</Label>
              <Select
                id="tipe"
                value={tipe}
                onChange={(e) => setTipe(e.target.value as TipeSoal)}
              >
                {tipeSoalList.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Jumlah Soal</Label>
              <div className="grid grid-cols-4 gap-2">
                {jumlahSoalOptions.map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-pressed={jumlah === n}
                    onClick={() => setJumlah(n)}
                    className={cn(
                      "rounded-md border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      jumlah === n
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-input hover:bg-accent",
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Ringkasan: {jumlah} soal {mapel} · {topik} · {jenjang} kelas{" "}
              {kelas} · {kesulitan}
            </p>
            <Button type="submit" size="lg" className="sm:w-auto">
              <Sparkles className="h-4 w-4" />
              Buat Latihan
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
