"use client";

import { useState } from "react";
import { CheckCircle2, LifeBuoy, Send } from "lucide-react";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const guruTersedia = [
  "Pak Bagus Santoso (Matematika)",
  "Bu Sari Melati (IPA)",
  "Wali Kelas 8B",
];

/**
 * Tombol & alur "minta bantuan guru": meneruskan sesi tutor ke guru bila AI
 * tidak cukup membantu atau ada indikasi yang perlu perhatian manusia.
 */
export function EskalasiGuru() {
  const [open, setOpen] = useState(false);
  const [guru, setGuru] = useState(guruTersedia[0]);
  const [catatan, setCatatan] = useState("");
  const [terkirim, setTerkirim] = useState(false);

  function reset() {
    setTerkirim(false);
    setCatatan("");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <LifeBuoy className="h-4 w-4" />
          Minta Bantuan Guru
        </Button>
      </DialogTrigger>
      <DialogContent>
        {terkirim ? (
          <div className="space-y-4 py-4 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
            <div>
              <p className="font-semibold">Diteruskan ke guru</p>
              <p className="text-sm text-muted-foreground">
                {guru.split(" (")[0]} akan menerima sesi belajarmu dan
                menindaklanjuti. Kamu bisa lanjut belajar dengan tutor sambil
                menunggu.
              </p>
            </div>
            <DialogClose asChild>
              <Button>Selesai</Button>
            </DialogClose>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Minta Bantuan Guru</DialogTitle>
              <DialogDescription>
                Sesi belajarmu akan diteruskan ke guru agar bisa dibantu lebih
                lanjut.
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setTerkirim(true);
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="guru">Teruskan ke</Label>
                <Select
                  id="guru"
                  value={guru}
                  onChange={(e) => setGuru(e.target.value)}
                >
                  {guruTersedia.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="catatan">Catatan untuk guru (opsional)</Label>
                <Textarea
                  id="catatan"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Ceritakan bagian mana yang masih membingungkan…"
                  className="min-h-24"
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit">
                  <Send className="h-4 w-4" />
                  Kirim ke Guru
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
