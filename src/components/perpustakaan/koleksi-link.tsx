"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark } from "lucide-react";

import { Button } from "@/components/ui/button";
import { loadKoleksi, KOLEKSI_EVENT } from "@/lib/storage/koleksi";

/** Tautan ke Koleksi Tersimpan dengan jumlah buku tersimpan. */
export function KoleksiLink() {
  const [jumlah, setJumlah] = useState<number | null>(null);

  useEffect(() => {
    const sync = () => setJumlah(loadKoleksi().length);
    sync();
    window.addEventListener(KOLEKSI_EVENT, sync);
    return () => window.removeEventListener(KOLEKSI_EVENT, sync);
  }, []);

  return (
    <Button asChild variant="outline">
      <Link href="/perpustakaan/koleksi">
        <Bookmark className="h-4 w-4" />
        Koleksi Tersimpan
        {jumlah && jumlah > 0 ? (
          <span className="ml-1 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
            {jumlah}
          </span>
        ) : null}
      </Link>
    </Button>
  );
}
