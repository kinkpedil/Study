"use client";

import { useState } from "react";
import { CheckCircle2, Clock, Mail, Send, ShieldCheck, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRole } from "@/components/role/role-context";
import {
  persetujuanOrtu,
  izinData,
  type PersetujuanStatus,
} from "@/lib/mock/akun";

const statusMeta: Record<
  PersetujuanStatus,
  { label: string; variant: "success" | "smp" | "secondary"; icon: typeof CheckCircle2 }
> = {
  disetujui: { label: "Disetujui", variant: "success", icon: CheckCircle2 },
  menunggu: { label: "Menunggu", variant: "smp", icon: Clock },
  belum: { label: "Belum diminta", variant: "secondary", icon: Clock },
};

/**
 * Persetujuan orang tua/wali untuk akun anak (perlindungan data anak). Hanya
 * relevan untuk siswa: menampilkan status persetujuan, kontak wali, dan kontrol
 * izin pemrosesan data. Data tiruan; pencatatan asli di layer backend.
 */
export function PersetujuanOrtu() {
  const { role } = useRole();
  const [status, setStatus] = useState(persetujuanOrtu.status);
  const [email, setEmail] = useState(persetujuanOrtu.waliEmail);
  const [izin, setIzin] = useState(
    () => Object.fromEntries(izinData.map((i) => [i.id, i.aktif])),
  );

  if (role !== "siswa") {
    return (
      <Card>
        <CardContent className="flex items-start gap-3 p-5">
          <Users className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Persetujuan orang tua/wali berlaku untuk akun siswa (anak) sebagai
            bagian dari perlindungan data anak.
          </p>
        </CardContent>
      </Card>
    );
  }

  const meta = statusMeta[status];
  const StatusIcon = meta.icon;

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="font-medium">Persetujuan orang tua/wali</p>
                <p className="text-sm text-muted-foreground">
                  {persetujuanOrtu.waliNama}
                  {status === "disetujui" && persetujuanOrtu.tanggal
                    ? ` · disetujui ${persetujuanOrtu.tanggal}`
                    : ""}
                </p>
              </div>
            </div>
            <Badge variant={meta.variant} className="gap-1">
              <StatusIcon className="h-3 w-3" />
              {meta.label}
            </Badge>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wali-email">Email wali</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="wali-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                type="button"
                variant={status === "disetujui" ? "outline" : "default"}
                onClick={() => setStatus("menunggu")}
                disabled={email.trim().length === 0}
              >
                <Send className="h-4 w-4" />
                {status === "disetujui" ? "Kirim ulang" : "Minta persetujuan"}
              </Button>
            </div>
            {status === "menunggu" && (
              <p className="text-xs text-muted-foreground">
                Permintaan persetujuan telah dikirim ke wali. Akun tetap terbatas
                hingga disetujui.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <p className="mb-3 text-sm font-medium">Izin pemrosesan data</p>
          <ul className="space-y-2">
            {izinData.map((i) => {
              const on = izin[i.id];
              return (
                <li
                  key={i.id}
                  className="flex items-start justify-between gap-3 rounded-lg border p-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {i.label}
                      {i.wajib && (
                        <span className="ml-2 text-[10px] uppercase text-muted-foreground">
                          wajib
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {i.deskripsi}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={on}
                    aria-label={i.label}
                    disabled={i.wajib}
                    onClick={() =>
                      setIzin((prev) => ({ ...prev, [i.id]: !prev[i.id] }))
                    }
                    className={cn(
                      "relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60",
                      on ? "bg-primary" : "bg-muted-foreground/30",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform",
                        on ? "translate-x-[22px]" : "translate-x-0.5",
                      )}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
