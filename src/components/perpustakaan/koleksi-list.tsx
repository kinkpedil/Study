"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookmarkX, Library } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BukuCard } from "./buku-card";
import { getBuku, type Buku } from "@/lib/mock/perpustakaan";
import {
  loadKoleksi,
  hapusKoleksi,
  KOLEKSI_EVENT,
} from "@/lib/storage/koleksi";

export function KoleksiList() {
  const [buku, setBuku] = useState<Buku[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const sync = () => {
      const list = loadKoleksi()
        .map((id) => getBuku(id))
        .filter((b): b is Buku => Boolean(b));
      setBuku(list);
      setHydrated(true);
    };
    sync();
    window.addEventListener(KOLEKSI_EVENT, sync);
    return () => window.removeEventListener(KOLEKSI_EVENT, sync);
  }, []);

  if (!hydrated) return null;

  if (buku.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border bg-card py-14 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Library className="h-6 w-6" />
        </span>
        <div>
          <p className="text-sm font-medium">Belum ada buku tersimpan</p>
          <p className="text-sm text-muted-foreground">
            Simpan buku favoritmu agar mudah diakses kembali.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/perpustakaan">Jelajahi perpustakaan</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {buku.map((b) => (
        <div key={b.id} className="relative">
          <BukuCard buku={b} />
          <button
            type="button"
            onClick={() => hapusKoleksi(b.id)}
            aria-label={`Hapus ${b.judul} dari koleksi`}
            className="absolute left-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-destructive shadow-sm transition-colors hover:bg-destructive hover:text-destructive-foreground"
          >
            <BookmarkX className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
