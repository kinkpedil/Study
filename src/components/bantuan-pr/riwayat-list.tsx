"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MessageCircleQuestion, Search } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { riwayatBantuan } from "@/lib/mock/bantuan-pr";

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const mapelList = [
  "Semua",
  ...Array.from(new Set(riwayatBantuan.map((s) => s.mapel))),
];

/** Daftar lengkap riwayat sesi Bantuan PR dengan pencarian & filter mapel. */
export function RiwayatList() {
  const [query, setQuery] = useState("");
  const [mapel, setMapel] = useState("Semua");

  const hasil = useMemo(() => {
    const q = query.trim().toLowerCase();
    return riwayatBantuan
      .filter((s) => (mapel === "Semua" ? true : s.mapel === mapel))
      .filter(
        (s) =>
          q === "" ||
          s.judul.toLowerCase().includes(q) ||
          s.cuplikan.toLowerCase().includes(q),
      )
      .sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  }, [query, mapel]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari riwayat bantuan…"
            aria-label="Cari riwayat"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {mapelList.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMapel(m)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                mapel === m
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-input text-muted-foreground hover:bg-accent",
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {hasil.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Tidak ada riwayat yang cocok.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y">
              {hasil.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/bantuan-pr/${s.id}`}
                    className="flex items-start gap-3 px-5 py-4 transition-colors hover:bg-accent/40"
                  >
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <MessageCircleQuestion className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium">
                          {s.judul}
                        </p>
                        {!s.selesai && (
                          <Badge variant="warning" className="text-[10px]">
                            Berlangsung
                          </Badge>
                        )}
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {s.cuplikan}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">
                          {s.mapel}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">
                          {s.jumlahPetunjuk} petunjuk · {formatTanggal(s.tanggal)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
