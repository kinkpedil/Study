"use client";

import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  isSaved,
  toggleKoleksi,
  KOLEKSI_EVENT,
} from "@/lib/storage/koleksi";

/** Tombol simpan/hapus buku ke Koleksi Tersimpan (localStorage). */
export function SaveButton({
  bukuId,
  className,
}: {
  bukuId: string;
  className?: string;
}) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sync = () => setSaved(isSaved(bukuId));
    sync();
    window.addEventListener(KOLEKSI_EVENT, sync);
    return () => window.removeEventListener(KOLEKSI_EVENT, sync);
  }, [bukuId]);

  return (
    <Button
      type="button"
      variant={saved ? "secondary" : "outline"}
      className={className}
      onClick={() => setSaved(toggleKoleksi(bukuId))}
      aria-pressed={saved}
    >
      {saved ? (
        <>
          <BookmarkCheck className="h-4 w-4" />
          Tersimpan
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4" />
          Simpan
        </>
      )}
    </Button>
  );
}
