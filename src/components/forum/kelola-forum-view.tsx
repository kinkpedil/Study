"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldAlert, UserPlus, X } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useRole } from "@/components/role/role-context";
import {
  pengaduanSekolah,
  moderatorSekolah,
  statusPengaduanLabel,
  type Pengaduan,
  type PengaduanStatus,
  type Moderator,
} from "@/lib/mock/forum";

const statusVariant: Record<
  PengaduanStatus,
  "secondary" | "warning" | "success"
> = {
  baru: "secondary",
  diproses: "warning",
  selesai: "success",
};

export function KelolaForumView() {
  const { profile } = useRole();
  const [pengaduan, setPengaduan] = useState<Pengaduan[]>(pengaduanSekolah);
  const [moderator, setModerator] = useState<Moderator[]>(moderatorSekolah);
  const [namaBaru, setNamaBaru] = useState("");

  if (profile.role !== "admin") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <ShieldAlert className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">Khusus admin sekolah</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Halaman pengelolaan forum sekolah hanya untuk admin. Kamu masuk
            sebagai {profile.role}.
          </p>
          <Button asChild variant="outline">
            <Link href="/forum">Kembali ke Forum</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  function ubahStatus(id: string, status: PengaduanStatus) {
    setPengaduan((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p)),
    );
  }

  function angkatModerator(e: React.FormEvent) {
    e.preventDefault();
    const nama = namaBaru.trim();
    if (!nama) return;
    setModerator((prev) => [
      ...prev,
      { id: `md_${prev.length + 1}`, nama, peran: "guru", sejak: "baru" },
    ]);
    setNamaBaru("");
  }

  return (
    <div className="space-y-6">
      {/* Tindak lanjut pengaduan */}
      <Card>
        <CardHeader>
          <CardTitle>Tindak Lanjut Pengajuan Masalah</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pengaduan.map((p) => (
            <div
              key={p.id}
              className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">{p.judul}</p>
                  <Badge variant={statusVariant[p.status]} className="text-[10px]">
                    {statusPengaduanLabel[p.status]}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {p.visibility === "privat" ? "Privat" : "Publik"}
                  </Badge>
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {p.ringkas} · {p.pelapor}
                </p>
              </div>
              <Select
                aria-label={`Status ${p.judul}`}
                value={p.status}
                onChange={(e) =>
                  ubahStatus(p.id, e.target.value as PengaduanStatus)
                }
                className="sm:w-40"
              >
                <option value="baru">Baru</option>
                <option value="diproses">Diproses</option>
                <option value="selesai">Selesai</option>
              </Select>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Moderator */}
      <Card>
        <CardHeader>
          <CardTitle>Moderator Forum Sekolah</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="space-y-2">
            {moderator.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">{m.nama}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.peran === "guru" ? "Guru" : "Siswa"} · sejak {m.sejak}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={`Cabut ${m.nama}`}
                  onClick={() =>
                    setModerator((prev) => prev.filter((x) => x.id !== m.id))
                  }
                  className="rounded-md p-1 text-destructive transition-colors hover:bg-destructive/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>

          <form onSubmit={angkatModerator} className="flex gap-2">
            <Input
              value={namaBaru}
              onChange={(e) => setNamaBaru(e.target.value)}
              placeholder="Nama guru/siswa yang diangkat…"
            />
            <Button type="submit" disabled={namaBaru.trim().length === 0}>
              <UserPlus className="h-4 w-4" />
              Angkat
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
