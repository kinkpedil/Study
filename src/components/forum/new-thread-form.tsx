"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Send } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useRole } from "@/components/role/role-context";
import {
  kategoriForum,
  scopeLabel,
  type ForumScope,
} from "@/lib/mock/forum";

const scopes: ForumScope[] = ["jenjang", "umum", "sekolah"];

export function NewThreadForm() {
  const { profile } = useRole();
  const [judul, setJudul] = useState("");
  const [kategori, setKategori] = useState(kategoriForum[0]);
  const [scope, setScope] = useState<ForumScope>(
    profile.jenjang ? "jenjang" : "umum",
  );
  const [isi, setIsi] = useState("");
  const [terkirim, setTerkirim] = useState(false);

  const valid = judul.trim().length >= 5 && isi.trim().length >= 10;

  if (terkirim) {
    return (
      <Card>
        <CardContent className="space-y-4 py-8 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
          <div>
            <p className="font-semibold">Diskusi terkirim</p>
            <p className="text-sm text-muted-foreground">
              Topikmu akan tampil di {scopeLabel[scope]} setelah lolos moderasi.
            </p>
          </div>
          <Button asChild>
            <Link href="/forum">Kembali ke forum</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buat Diskusi Baru</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (valid) setTerkirim(true);
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="judul">Judul</Label>
            <Input
              id="judul"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Tulis judul yang jelas…"
              maxLength={120}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="kategori">Kategori</Label>
              <Select
                id="kategori"
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
              >
                {kategoriForum.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="scope">Ruang</Label>
              <Select
                id="scope"
                value={scope}
                onChange={(e) => setScope(e.target.value as ForumScope)}
              >
                {scopes
                  .filter((s) => s !== "jenjang" || profile.jenjang)
                  .map((s) => (
                    <option key={s} value={s}>
                      {scopeLabel[s]}
                      {s === "jenjang" && profile.jenjang
                        ? ` (${profile.jenjang})`
                        : ""}
                    </option>
                  ))}
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="isi">Isi diskusi</Label>
            <Textarea
              id="isi"
              value={isi}
              onChange={(e) => setIsi(e.target.value)}
              placeholder="Jelaskan pertanyaan atau topik diskusimu…"
              className="min-h-40"
            />
          </div>

          {scope === "umum" && (
            <p className="rounded-lg bg-accent/40 px-3 py-2 text-xs text-muted-foreground">
              Topik ini akan tampil di forum terbuka lintas jenjang dengan label{" "}
              <strong>{profile.jenjang ?? "Guru"}</strong>.
            </p>
          )}

          <div className="flex items-center justify-between border-t pt-4">
            <Badge variant="secondary">Diskusi diawasi & dimoderasi</Badge>
            <Button type="submit" disabled={!valid}>
              <Send className="h-4 w-4" />
              Kirim Diskusi
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
