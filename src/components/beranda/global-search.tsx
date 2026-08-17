"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchSuggestions } from "@/lib/mock/beranda";

const typeLabel: Record<string, string> = {
  materi: "Materi",
  soal: "Soal",
  buku: "Buku",
  diskusi: "Diskusi",
};

export function GlobalSearch() {
  const [query, setQuery] = useState("");

  return (
    <section
      aria-label="Pencarian global"
      className="rounded-2xl bg-gradient-to-br from-primary to-primary/70 p-6 text-primary-foreground shadow-sm md:p-8"
    >
      <h1 className="text-xl font-bold md:text-2xl">
        Selamat datang kembali 👋
      </h1>
      <p className="mt-1 text-sm text-primary-foreground/80">
        Cari materi, soal, buku, atau diskusi — semua dalam satu tempat.
      </p>

      <form
        role="search"
        className="mt-4 flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik kata kunci, mis. persamaan linear…"
            aria-label="Kata kunci pencarian"
            className="h-11 bg-background pl-9 text-foreground"
          />
        </div>
        <Button
          type="submit"
          size="lg"
          variant="secondary"
          className="h-11 shrink-0"
        >
          Cari
        </Button>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-primary-foreground/70">Populer:</span>
        {searchSuggestions.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setQuery(s.label)}
            className="rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-medium transition-colors hover:bg-primary-foreground/25"
          >
            <span className="opacity-70">{typeLabel[s.type]} · </span>
            {s.label}
          </button>
        ))}
      </div>
    </section>
  );
}
