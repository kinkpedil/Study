"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  FileQuestion,
  Library,
  MessagesSquare,
  type LucideIcon,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  searchSuggestions,
  searchMock,
  type SearchType,
} from "@/lib/mock/beranda";

const typeLabel: Record<SearchType, string> = {
  materi: "Materi",
  soal: "Soal",
  buku: "Buku",
  diskusi: "Diskusi",
};

const typeIcon: Record<SearchType, LucideIcon> = {
  materi: BookOpen,
  soal: FileQuestion,
  buku: Library,
  diskusi: MessagesSquare,
};

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const results = useMemo(() => searchMock(query), [query]);
  const showResults = focused && query.trim().length > 0;

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
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 120)}
            placeholder="Ketik kata kunci, mis. persamaan linear…"
            aria-label="Kata kunci pencarian"
            aria-expanded={showResults}
            role="combobox"
            aria-controls="hasil-pencarian"
            className="h-11 bg-background pl-9 text-foreground"
          />

          {/* Hasil pencarian tiruan */}
          {showResults && (
            <div
              id="hasil-pencarian"
              role="listbox"
              className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-lg"
            >
              {results.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                  Tidak ada hasil untuk “{query}”.
                </p>
              ) : (
                <ul className="max-h-80 divide-y overflow-y-auto">
                  {results.map((r) => {
                    const Icon = typeIcon[r.type];
                    return (
                      <li key={r.id} role="option" aria-selected={false}>
                        <Link
                          href={r.href}
                          className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/60 focus-visible:bg-accent/60 focus-visible:outline-none"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">
                              {r.title}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {r.subtitle}
                            </span>
                          </span>
                          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                            {typeLabel[r.type]}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
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
