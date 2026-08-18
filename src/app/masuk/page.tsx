import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { MasukForm } from "@/components/akun/masuk-form";

export const metadata: Metadata = {
  title: "Masuk",
};

export default function MasukPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-sm space-y-6">
        <Link href="/" className="flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Sekolah Cerdas
          </span>
        </Link>

        <div className="text-center">
          <h1 className="text-xl font-semibold">Selamat datang kembali</h1>
          <p className="text-sm text-muted-foreground">
            Masuk untuk melanjutkan belajar.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <MasukForm />
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Dengan masuk, kamu menyetujui perlindungan data & ketentuan penggunaan.
        </p>
      </div>
    </main>
  );
}
