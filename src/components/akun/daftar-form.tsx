"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ShieldCheck, UserPlus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/mock/roles";

const peranPilihan: { role: Role; label: string; deskripsi: string }[] = [
  { role: "siswa", label: "Siswa", deskripsi: "Belajar & kerjakan tugas" },
  { role: "guru", label: "Guru", deskripsi: "Ajar & nilai siswa" },
  { role: "admin", label: "Admin Sekolah", deskripsi: "Kelola sekolah" },
];

/**
 * Formulir pendaftaran adaptif peran (data tiruan). Siswa mengisi jenjang &
 * kelas; guru/admin cukup data sekolah. Belum memanggil pendaftaran asli —
 * mengarahkan ke Beranda setelah submit.
 */
export function DaftarForm() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("siswa");
  const [proses, setProses] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setProses(true);
    window.setTimeout(() => router.push("/"), 500);
  }

  return (
    <div className="space-y-5">
      {/* Pemilih peran */}
      <div>
        <Label className="mb-2 block">Saya mendaftar sebagai</Label>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Peran">
          {peranPilihan.map((p) => {
            const aktif = role === p.role;
            return (
              <button
                key={p.role}
                type="button"
                role="radio"
                aria-checked={aktif}
                onClick={() => setRole(p.role)}
                className={cn(
                  "rounded-lg border p-3 text-left transition-colors",
                  aktif
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "hover:border-primary/40 hover:bg-accent/40",
                )}
              >
                <span className="block text-sm font-medium">{p.label}</span>
                <span className="mt-0.5 block text-[11px] leading-tight text-muted-foreground">
                  {p.deskripsi}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nama">Nama lengkap</Label>
          <Input id="nama" autoComplete="name" placeholder="Nama lengkap" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="nama@contoh.sch.id"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sekolah">Sekolah</Label>
          <Input id="sekolah" placeholder="Nama sekolah" required />
        </div>

        {/* Khusus siswa: jenjang & kelas (data anak) */}
        {role === "siswa" && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="jenjang">Jenjang</Label>
              <Select id="jenjang" defaultValue="SMP">
                <option value="SD">SD</option>
                <option value="SMP">SMP</option>
                <option value="SMA">SMA</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="kelas">Kelas</Label>
              <Input id="kelas" placeholder="mis. 8B" required />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="password">Kata sandi</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Minimal 8 karakter"
            minLength={8}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={proses}>
          {proses ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
          Daftar
        </Button>
      </form>

      {/* Catatan perlindungan data anak, khusus siswa */}
      <div className="flex items-start gap-2 rounded-lg border bg-accent/30 p-3">
        {role === "siswa" ? (
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        ) : (
          <Users className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        )}
        <p className="text-xs text-muted-foreground">
          {role === "siswa"
            ? "Data siswa dilindungi dan sebaiknya didaftarkan dengan sepengetahuan orang tua/wali."
            : "Akun guru/admin diverifikasi oleh sekolah sebelum mendapat akses penuh."}
        </p>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Sudah punya akun?{" "}
        <Link href="/masuk" className="font-medium text-primary hover:underline">
          Masuk
        </Link>
      </p>
    </div>
  );
}
