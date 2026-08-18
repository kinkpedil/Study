"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRole } from "@/components/role/role-context";
import { akunProfil } from "@/lib/mock/akun";

/**
 * Formulir ubah profil (data tiruan). Nama & kelas (siswa) dapat diubah; email
 * dan jenjang dikelola/diverifikasi sistem sehingga hanya tampil. Menyimpan
 * secara tiruan dengan umpan balik "tersimpan".
 */
export function ProfilForm() {
  const { role } = useRole();
  const awal = akunProfil[role];

  const [nama, setNama] = useState(awal.nama);
  const [kelas, setKelas] = useState(awal.kelas ?? "");
  const [status, setStatus] = useState<"idle" | "simpan" | "tersimpan">("idle");

  const berubah = nama !== awal.nama || kelas !== (awal.kelas ?? "");

  function simpan(e: React.FormEvent) {
    e.preventDefault();
    if (!berubah || nama.trim().length === 0) return;
    setStatus("simpan");
    window.setTimeout(() => {
      setStatus("tersimpan");
      window.setTimeout(() => setStatus("idle"), 2000);
    }, 500);
  }

  return (
    <Card>
      <CardContent className="p-5">
        <form onSubmit={simpan} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama">Nama lengkap</Label>
            <Input
              id="nama"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={awal.email} readOnly disabled />
              <p className="text-xs text-muted-foreground">
                Email dikelola sistem. Hubungi admin untuk mengubah.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sekolah">Sekolah</Label>
              <Input id="sekolah" value={awal.sekolah} readOnly disabled />
            </div>
          </div>

          {role === "siswa" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="jenjang">Jenjang</Label>
                <Input id="jenjang" value={awal.jenjang ?? ""} readOnly disabled />
                <p className="text-xs text-muted-foreground">
                  Perubahan jenjang diverifikasi sekolah.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="kelas">Kelas</Label>
                <Input
                  id="kelas"
                  value={kelas}
                  onChange={(e) => setKelas(e.target.value)}
                  placeholder="mis. 8B"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={!berubah || status === "simpan"}
            >
              {status === "simpan" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Simpan perubahan
            </Button>
            {status === "tersimpan" && (
              <span className="flex items-center gap-1 text-sm text-success">
                <Check className="h-4 w-4" />
                Tersimpan
              </span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
