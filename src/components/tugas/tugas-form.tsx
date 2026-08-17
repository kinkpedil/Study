"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, FileText, Paperclip, Send, ShieldAlert } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useRole } from "@/components/role/role-context";
import { mapelTugas, kelasTugas, type TugasTipe } from "@/lib/mock/tugas";

export function TugasForm() {
  const { profile } = useRole();
  const [judul, setJudul] = useState("");
  const [mapel, setMapel] = useState(mapelTugas[0]);
  const [kelas, setKelas] = useState(kelasTugas[0]);
  const [deskripsi, setDeskripsi] = useState("");
  const [tenggat, setTenggat] = useState("");
  const [tipe, setTipe] = useState<TugasTipe>("teks");
  const [terkirim, setTerkirim] = useState(false);

  if (profile.role === "siswa") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <ShieldAlert className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">Khusus guru</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Hanya guru yang dapat membuat dan mengirim tugas.
          </p>
          <Button asChild variant="outline">
            <Link href="/tugas">Kembali ke Tugas</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const valid = judul.trim().length >= 5 && tenggat.length > 0;

  if (terkirim) {
    return (
      <Card>
        <CardContent className="space-y-4 py-8 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
          <div>
            <p className="font-semibold">Tugas terkirim</p>
            <p className="text-sm text-muted-foreground">
              “{judul}” dikirim ke kelas {kelas}. Siswa akan menerima pengingat
              menjelang tenggat.
            </p>
          </div>
          <Button asChild>
            <Link href="/tugas">Lihat daftar tugas</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buat Tugas</CardTitle>
        <CardDescription>
          Susun tugas, tentukan tenggat, dan kirim ke kelas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (valid) setTerkirim(true);
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="judul">Judul tugas</Label>
            <Input
              id="judul"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="mis. Latihan Persamaan Linear"
              maxLength={120}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="mapel">Mata pelajaran</Label>
              <Select
                id="mapel"
                value={mapel}
                onChange={(e) => setMapel(e.target.value)}
              >
                {mapelTugas.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="kelas">Kirim ke kelas</Label>
              <Select
                id="kelas"
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
              >
                {kelasTugas.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenggat">Tenggat</Label>
              <Input
                id="tenggat"
                type="date"
                value={tenggat}
                onChange={(e) => setTenggat(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi / instruksi</Label>
            <Textarea
              id="deskripsi"
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Jelaskan apa yang harus dikerjakan siswa…"
              className="min-h-32"
            />
          </div>

          <div className="space-y-2">
            <Label>Bentuk pengumpulan</Label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { v: "teks" as const, icon: FileText, label: "Teks" },
                  { v: "file" as const, icon: Paperclip, label: "Unggah file" },
                ]
              ).map(({ v, icon: Icon, label }) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setTipe(v)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-colors",
                    tipe === v
                      ? "border-primary bg-primary/5"
                      : "border-input hover:bg-accent/40",
                  )}
                >
                  <Icon className="h-4 w-4 text-primary" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end border-t pt-4">
            <Button type="submit" disabled={!valid}>
              <Send className="h-4 w-4" />
              Kirim Tugas
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
