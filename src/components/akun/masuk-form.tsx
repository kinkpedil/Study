"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, LogIn, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { akunDemo, type AkunDemo } from "@/lib/mock/auth";

/**
 * Formulir masuk (data tiruan). Belum memanggil autentikasi asli — mengarahkan
 * ke Beranda setelah "masuk". Menyediakan akun demo untuk mencoba tiap peran.
 */
export function MasukForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [lihatSandi, setLihatSandi] = useState(false);
  const [proses, setProses] = useState(false);

  function pakaiDemo(akun: AkunDemo) {
    setEmail(akun.email);
    setPassword("demo1234");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim().length === 0 || password.length === 0) return;
    setProses(true);
    // Tiruan: tanpa verifikasi kredensial, langsung ke Beranda.
    window.setTimeout(() => router.push("/"), 500);
  }

  return (
    <div className="space-y-5">
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="nama@contoh.sch.id"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Kata sandi</Label>
            <Link
              href="/lupa-sandi"
              className="text-xs text-primary hover:underline"
            >
              Lupa sandi?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={lihatSandi ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Masukkan kata sandi"
              className="pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setLihatSandi((v) => !v)}
              aria-label={lihatSandi ? "Sembunyikan sandi" : "Lihat sandi"}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
            >
              {lihatSandi ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={proses}>
          {proses ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogIn className="h-4 w-4" />
          )}
          Masuk
        </Button>
      </form>

      <div className="space-y-2">
        <p className="text-center text-xs text-muted-foreground">
          Coba dengan akun demo
        </p>
        <div className="grid grid-cols-3 gap-2">
          {akunDemo.map((a) => (
            <Button
              key={a.role}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => pakaiDemo(a)}
            >
              {a.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-lg border bg-accent/30 p-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-xs text-muted-foreground">
          Data siswa dilindungi. Jangan bagikan kata sandimu kepada siapa pun.
        </p>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Belum punya akun?{" "}
        <Link href="/daftar" className="font-medium text-primary hover:underline">
          Daftar
        </Link>
      </p>
    </div>
  );
}
