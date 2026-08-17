"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { BukuCard } from "./buku-card";
import { daftarBuku } from "@/lib/mock/perpustakaan";

/** Daftar buku dengan pencarian dasar (judul/penulis/mapel). */
export function BukuGrid() {
  const [query, setQuery] = useState("");

  const hasil = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return daftarBuku;
    return daftarBuku.filter(
      (b) =>
        b.judul.toLowerCase().includes(q) ||
        b.penulis.toLowerCase().includes(q) ||
        b.mapel.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari buku berdasarkan judul, penulis, atau mapel…"
          aria-label="Cari buku"
          className="pl-9"
        />
      </div>

      {hasil.length === 0 ? (
        <p className="rounded-xl border bg-card py-10 text-center text-sm text-muted-foreground">
          Tidak ada buku yang cocok dengan “{query}”.
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
