"use client";

import { useMemo, useState } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { BukuCard } from "./buku-card";
import type { Jenjang } from "@/lib/mock/beranda";
import {
  cariBuku,
  daftarBuku,
  kategoriList,
  type KategoriBuku,
} from "@/lib/mock/perpustakaan";

const jenjangOpsi: (Jenjang | "Semua")[] = ["Semua", "SD", "SMP", "SMA"];
const mapelOpsi = ["Semua", ...Array.from(new Set(daftarBuku.map((b) => b.mapel)))];

/**
 * Daftar buku dengan pencarian + filter jenjang, jenis (kategori), dan mapel.
 */
export function BukuGrid() {
  const [query, setQuery] = useState("");
  const [jenjang, setJenjang] = useState<Jenjang | "Semua">("Semua");
  const [kategori, setKategori] = useState<KategoriBuku | "Semua">("Semua");
  const [mapel, setMapel] = useState("Semua");

  const adaFilter =
    jenjang !== "Semua" || kategori !== "Semua" || mapel !== "Semua";

  const hasil = useMemo(() => {
    const terfilter = daftarBuku.filter(
      (b) =>
        (jenjang === "Semua" || b.jenjang === jenjang) &&
        (kategori === "Semua" || b.kategori === kategori) &&
        (mapel === "Semua" || b.mapel === mapel),
    );
    return cariBuku(query, terfilter);
  }, [query, jenjang, kategori, mapel]);

  function reset() {
    setJenjang("Semua");
    setKategori("Semua");
    setMapel("Semua");
    setQuery("");
  }

  return (
    <div className="space-y-4">
      {/* Pencarian */}
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari mis. “matematika smp” atau “kelas 8”…"
          aria-label="Cari buku"
          className="pl-9 pr-9"
        />
        {query.trim().length > 0 && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Hapus pencarian"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="space-y-3 rounded-xl border bg-muted/20 p-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm font-medium">
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </span>
          {(adaFilter || query) && (
            <Button variant="ghost" size="sm" onClick={reset}>
              Reset
            </Button>
          )}
        </div>

        {/* Jenjang & Jenis sebagai chip */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">
              Jenjang
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {jenjangOpsi.map((j) => (
                <button
                  key={j}
                  type="button"
                  onClick={() => setJenjang(j)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    jenjang === j
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input text-muted-foreground hover:bg-accent",
                  )}
                >
                  {j}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">
              Jenis
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {(["Semua", ...kategoriList] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKategori(k)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    kategori === k
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input text-muted-foreground hover:bg-accent",
                  )}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mapel sebagai select */}
        <div className="max-w-xs">
          <Label
            htmlFor="filter-mapel"
            className="mb-1.5 block text-xs text-muted-foreground"
          >
            Mata pelajaran
          </Label>
          <Select
            id="filter-mapel"
            value={mapel}
            onChange={(e) => setMapel(e.target.value)}
          >
            {mapelOpsi.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <p className="text-xs text-muted-foreground" aria-live="polite">
        {hasil.length} dari {daftarBuku.length} buku
      </p>

      {hasil.length === 0 ? (
        <p className="rounded-xl border bg-card py-10 text-center text-sm text-muted-foreground">
          Tidak ada buku yang cocok. Coba ubah kata kunci atau filter.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {hasil.map((buku) => (
            <BukuCard key={buku.id} buku={buku} />
          ))}
        </div>
      )}
    </div>
  );
}
