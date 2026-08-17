"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Globe, Lock, Send } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { PengaduanVisibility } from "@/lib/mock/forum";

export function PengaduanForm() {
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [visibility, setVisibility] = useState<PengaduanVisibility>("privat");
  const [terkirim, setTerkirim] = useState(false);

  const valid = judul.trim().length >= 5 && deskripsi.trim().length >= 10;

  if (terkirim) {
    return (
      <Card>
        <CardContent className="space-y-4 py-8 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
          <div>
            <p className="font-semibold">Pengajuan terkirim</p>
            <p className="text-sm text-muted-foreground">
              Admin sekolah akan menindaklanjuti. Kamu bisa memantau statusnya
              di Forum Sekolah.
            </p>
          </div>
          <Button asChild>
            <Link href="/forum">Kembali ke Forum</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ajukan Masalah</CardTitle>
        <CardDescription>
          Sampaikan masalah atau keluhan ke admin sekolah untuk ditindaklanjuti.
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
            <Label htmlFor="judul">Judul masalah</Label>
            <Input
              id="judul"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Ringkas masalahnya…"
              maxLength={120}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Textarea
              id="deskripsi"
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Jelaskan detail masalahnya…"
              className="min-h-32"
            />
          </div>

          <div className="space-y-2">
            <Label>Visibilitas</Label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  {
                    v: "privat" as const,
                    icon: Lock,
                    judul: "Privat",
                    ket: "Hanya kamu & admin",
                  },
                  {
                    v: "publik" as const,
                    icon: Globe,
                    judul: "Publik",
                    ket: "Terlihat warga sekolah",
                  },
                ]
              ).map(({ v, icon: Icon, judul: j, ket }) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVisibility(v)}
                  className={cn(
                    "flex items-start gap-2 rounded-lg border p-3 text-left transition-colors",
                    visibility === v
                      ? "border-primary bg-primary/5"
                      : "border-input hover:bg-accent/40",
                  )}
                >
                  <Icon className="mt-0.5 h-4 w-4 text-primary" />
                  <span>
                    <span className="block text-sm font-medium">{j}</span>
                    <span className="block text-xs text-muted-foreground">
                      {ket}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end border-t pt-4">
            <Button type="submit" disabled={!valid}>
              <Send className="h-4 w-4" />
              Kirim Pengajuan
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
