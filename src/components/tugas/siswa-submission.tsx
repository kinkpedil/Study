"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  FileText,
  Paperclip,
  Send,
  Star,
  Upload,
  X,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  statusTugas,
  sisaTenggat,
  formatTanggal,
  type TugasSiswa,
} from "@/lib/mock/tugas";

export function SiswaSubmission({ tugas }: { tugas: TugasSiswa }) {
  const meta = statusTugas(tugas.status);
  const sisa = sisaTenggat(tugas.tenggat);
  const [jawaban, setJawaban] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [terkumpul, setTerkumpul] = useState(
    tugas.status === "terkumpul" || tugas.status === "dinilai",
  );
  const fileRef = useRef<HTMLInputElement>(null);

  const bisaKirim =
    tugas.tipe === "teks" ? jawaban.trim().length > 0 : file !== null;

  return (
    <div className="space-y-6">
      {/* Detail tugas */}
      <Card>
        <CardContent className="space-y-3 p-5">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="text-[10px]">
              {tugas.mapel}
            </Badge>
            <Badge variant={meta.variant} className="text-[10px]">
              {meta.label}
            </Badge>
          </div>
          <h1 className="text-xl font-bold leading-tight">{tugas.judul}</h1>
          <p className="text-xs text-muted-foreground">
            {tugas.guru} · tenggat {formatTanggal(tugas.tenggat)}
          </p>
          {tugas.deskripsi && (
            <p className="text-sm leading-relaxed">{tugas.deskripsi}</p>
          )}
          {!terkumpul && (
            <div
              className={cn(
                "inline-flex items-center gap-1 text-sm",
                sisa.lewat
                  ? "text-destructive"
                  : sisa.mendesak
                    ? "text-warning"
                    : "text-muted-foreground",
              )}
            >
              <Clock className="h-4 w-4" />
              {sisa.teks}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nilai & komentar bila sudah dinilai */}
      {tugas.status === "dinilai" && (
        <Card className="border-success/40 bg-success/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-success" />
              <span className="text-lg font-bold text-success">
                {tugas.nilai}
              </span>
              <span className="text-sm text-muted-foreground">/ 100</span>
            </div>
            {tugas.komentar && (
              <p className="mt-2 text-sm">{tugas.komentar}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Kotak pengumpulan */}
      {terkumpul && tugas.status !== "dinilai" ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
            <CheckCircle2 className="h-8 w-8 text-success" />
            <p className="font-medium">Jawaban terkumpul</p>
            <p className="text-sm text-muted-foreground">
              Menunggu penilaian dari {tugas.guru}.
            </p>
          </CardContent>
        </Card>
      ) : tugas.status !== "dinilai" ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {tugas.tipe === "teks" ? (
                <FileText className="h-4 w-4" />
              ) : (
                <Paperclip className="h-4 w-4" />
              )}
              Kumpulkan Jawaban
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (bisaKirim) setTerkumpul(true);
              }}
              className="space-y-3"
            >
              {tugas.tipe === "teks" ? (
                <Textarea
                  value={jawaban}
                  onChange={(e) => setJawaban(e.target.value)}
                  placeholder="Tulis jawabanmu di sini…"
                  className="min-h-40"
                />
              ) : (
                <div>
                  <input
                    ref={fileRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                  {file ? (
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                      <Paperclip className="h-4 w-4 text-primary" />
                      <span className="min-w-0 flex-1 truncate text-sm">
                        {file.name}
                      </span>
                      <button
                        type="button"
                        aria-label="Hapus file"
                        onClick={() => {
                          setFile(null);
                          if (fileRef.current) fileRef.current.value = "";
                        }}
                        className="text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="flex w-full flex-col items-center gap-2 rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground transition-colors hover:bg-accent/40"
                    >
                      <Upload className="h-5 w-5 text-primary" />
                      Pilih file untuk diunggah
                    </button>
                  )}
                </div>
              )}

              <div className="flex justify-end border-t pt-3">
                <Button type="submit" disabled={!bisaKirim}>
                  <Send className="h-4 w-4" />
                  Kumpulkan
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Button asChild variant="ghost" size="sm">
        <Link href="/tugas">Kembali ke daftar tugas</Link>
      </Button>
    </div>
  );
}
