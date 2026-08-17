"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Megaphone, Send, ShieldAlert } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRole } from "@/components/role/role-context";

export function PengumumanForm() {
  const { profile } = useRole();
  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");
  const [terkirim, setTerkirim] = useState(false);

  // Hanya admin sekolah yang boleh membuat pengumuman.
  if (profile.role !== "admin") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <ShieldAlert className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">Khusus admin sekolah</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Hanya admin sekolah yang dapat membuat pengumuman. Kamu masuk
            sebagai {profile.role}.
          </p>
          <Button asChild variant="outline">
            <Link href="/forum">Kembali ke Forum</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const valid = judul.trim().length >= 5 && isi.trim().length >= 10;

  if (terkirim) {
    return (
      <Card>
        <CardContent className="space-y-4 py-8 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
          <div>
            <p className="font-semibold">Pengumuman terbit</p>
            <p className="text-sm text-muted-foreground">
              Pengumuman kini tampil di Forum Sekolah {profile.school}.
            </p>
          </div>
          <Button asChild>
            <Link href="/forum">Lihat di Forum</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" />
          Buat Pengumuman
        </CardTitle>
        <CardDescription>
          Pengumuman akan tampil untuk seluruh warga {profile.school}.
        </CardDescription>
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
            <Label htmlFor="judul">Judul pengumuman</Label>
            <Input
              id="judul"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="mis. Jadwal Ujian Tengah Semester"
              maxLength={120}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="isi">Isi</Label>
            <Textarea
              id="isi"
              value={isi}
              onChange={(e) => setIsi(e.target.value)}
              placeholder="Tulis isi pengumuman…"
              className="min-h-40"
            />
          </div>
          <div className="flex justify-end border-t pt-4">
            <Button type="submit" disabled={!valid}>
              <Send className="h-4 w-4" />
              Terbitkan
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
