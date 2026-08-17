"use client";

import { useEffect, useRef, useState } from "react";
/* eslint-disable @next/next/no-img-element -- pratinjau blob lokal, bukan aset */
import { ImagePlus, Trash2, UploadCloud } from "lucide-react";

import { cn } from "@/lib/utils";

const MAX_SIZE_MB = 5;
const ACCEPT = "image/png,image/jpeg,image/webp";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Komponen unggah foto soal: pilih/seret gambar, tampilkan pratinjau, dan
 * hapus. Terkendali dari luar lewat `value`/`onChange`. Unggahan asli ke
 * Supabase Storage disambung di task backend.
 */
export function PhotoUpload({
  value,
  onChange,
}: {
  value: File | null;
  onChange: (file: File | null) => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Buat & bersihkan object URL untuk pratinjau mengikuti file terpilih.
  useEffect(() => {
    // Sinkronisasi object URL (sistem eksternal) dengan file terpilih.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!value) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    /* eslint-enable react-hooks/set-state-in-effect */
    return () => URL.revokeObjectURL(url);
  }, [value]);

  function terima(file: File | undefined) {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar (PNG, JPG, atau WEBP).");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Ukuran maksimal ${MAX_SIZE_MB} MB.`);
      return;
    }
    onChange(file);
  }

  function hapus() {
    onChange(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => terima(e.target.files?.[0])}
      />

      {value && previewUrl ? (
        <div className="flex items-center gap-3 rounded-lg border p-3">
          <img
            src={previewUrl}
            alt="Pratinjau foto soal"
            className="h-16 w-16 shrink-0 rounded-md border object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{value.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatSize(value.size)}
            </p>
          </div>
          <button
            type="button"
            onClick={hapus}
            aria-label="Hapus foto"
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-destructive transition-colors hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
            Hapus
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            terima(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            dragOver
              ? "border-primary bg-primary/5"
              : "border-input hover:bg-accent/40",
          )}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            {dragOver ? (
              <UploadCloud className="h-5 w-5" />
            ) : (
              <ImagePlus className="h-5 w-5" />
            )}
          </span>
          <span className="text-sm font-medium">Unggah foto soal</span>
          <span className="text-xs text-muted-foreground">
            Seret & letakkan atau klik · PNG/JPG/WEBP · maks {MAX_SIZE_MB} MB
          </span>
        </button>
      )}

      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
