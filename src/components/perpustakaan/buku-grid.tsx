"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { BukuCard } from "./buku-card";
import { cariBuku, daftarBuku } from "@/lib/mock/perpustakaan";

/**
 * Daftar buku dengan pencarian multi-kata & multi-field (judul, penulis,
 * penerbit, mapel, kategori, jenjang, kelas, tahun).
 */
export function BukuGrid() {
  const [query, setQuery] = useState("");

  const hasil = useMemo(() => cariBuku(query), [query]);
  const sedangMencari = query.trim().length > 0;

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari mis. “matematika smp” atau “kelas 8”…"
          aria-label="Cari buku"
          className="pl-9 pr-9"
        />
        {sedangMencari && (
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

      <p className="text-xs text-muted-foreground" aria-live="polite">
        {sedangMencari
          ? `${hasil.length} dari ${daftarBuku.length} buku cocok`
          : `${daftarBuku.length} buku`}
      </p>

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
