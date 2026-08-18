"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, LogOut, Trash2 } from "lucide-react";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRole } from "@/components/role/role-context";

const KATA_KONFIRMASI = "HAPUS";

/**
 * Alur keluar & hapus akun. Keluar mengarahkan ke halaman masuk. Hapus akun
 * memerlukan konfirmasi mengetik kata kunci; untuk siswa disertai catatan
 * perlunya sepengetahuan orang tua/wali. Tiruan — belum memanggil backend.
 */
export function AkunKeluar() {
  const router = useRouter();
  const { role } = useRole();
  const [keluar, setKeluar] = useState(false);
  const [konfirmasi, setKonfirmasi] = useState("");
  const [hapus, setHapus] = useState(false);

  function keluarAkun() {
    setKeluar(true);
    window.setTimeout(() => router.push("/masuk"), 500);
  }

  function hapusAkun() {
    if (konfirmasi !== KATA_KONFIRMASI) return;
    setHapus(true);
    window.setTimeout(() => router.push("/masuk"), 700);
  }

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Keluar dari akun</p>
            <p className="text-sm text-muted-foreground">
              Kamu akan diarahkan ke halaman masuk.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={keluarAkun}
            disabled={keluar}
            className="shrink-0"
          >
            {keluar ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            Keluar
          </Button>
        </CardContent>
      </Card>

      {/* Zona berbahaya */}
      <Card className="border-destructive/40">
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-medium">Hapus akun</p>
              <p className="text-sm text-muted-foreground">
                Menghapus akun akan menghilangkan data belajarmu secara permanen.
                {role === "siswa"
                  ? " Untuk akun siswa, lakukan dengan sepengetahuan orang tua/wali."
                  : ""}
              </p>
            </div>
          </div>

          <Dialog
            onOpenChange={(v) => {
              if (!v) setKonfirmasi("");
            }}
          >
            <DialogTrigger asChild>
              <Button variant="destructive" className="shrink-0">
                <Trash2 className="h-4 w-4" />
                Hapus akun
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Hapus akun permanen?</DialogTitle>
                <DialogDescription>
                  Tindakan ini tidak dapat dibatalkan. Semua data belajar,
                  riwayat, dan progresmu akan dihapus.
                  {role === "siswa"
                    ? " Pastikan orang tua/wali mengetahui tindakan ini."
                    : ""}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2">
                <Label htmlFor="konfirmasi">
                  Ketik <span className="font-semibold">{KATA_KONFIRMASI}</span>{" "}
                  untuk mengonfirmasi
                </Label>
                <Input
                  id="konfirmasi"
                  value={konfirmasi}
                  onChange={(e) => setKonfirmasi(e.target.value)}
                  placeholder={KATA_KONFIRMASI}
                  autoComplete="off"
                />
              </div>

              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="outline">Batal</Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  onClick={hapusAkun}
                  disabled={konfirmasi !== KATA_KONFIRMASI || hapus}
                >
                  {hapus ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Hapus permanen
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
