import type { Metadata } from "next";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { AkunNav } from "@/components/akun/akun-nav";
import { AkunIdentitas } from "@/components/akun/akun-identitas";
import { ProfilForm } from "@/components/akun/profil-form";
import { PersetujuanOrtu } from "@/components/akun/persetujuan-ortu";
import { AkunHeaderActions } from "@/components/akun/akun-header-actions";
import { AkunKeluar } from "@/components/akun/akun-keluar";
import { AkunSection } from "@/components/akun/akun-section";

export const metadata: Metadata = {
  title: "Akun & Keamanan",
};

/** Placeholder ringkas untuk bagian yang diisi oleh task berikutnya. */
function SegeraHadir({ teks }: { teks: string }) {
  return (
    <Card>
      <CardContent className="p-5 text-sm text-muted-foreground">
        {teks}
      </CardContent>
    </Card>
  );
}

export default function AkunPage() {
  return (
    <AppShell>
      <PageHeader
        title="Akun & Keamanan"
        description="Kelola profil, kata sandi, sesi perangkat, preferensi, dan privasi datamu."
        action={<AkunHeaderActions />}
      />

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="lg:col-span-1">
          <AkunNav />
        </aside>

        <div className="min-w-0 space-y-8">
          <AkunSection
            id="profil"
            judul="Profil"
            deskripsi="Data diri dan sekolahmu."
          >
            <AkunIdentitas />
            <ProfilForm />
          </AkunSection>

          <AkunSection
            id="keamanan"
            judul="Keamanan"
            deskripsi="Akses akun, keluar, dan penghapusan akun."
          >
            <AkunKeluar />
          </AkunSection>

          <AkunSection
            id="sesi"
            judul="Sesi & Perangkat"
            deskripsi="Perangkat yang sedang masuk ke akunmu."
          >
            <SegeraHadir teks="Daftar sesi perangkat akan tersedia di bagian ini." />
          </AkunSection>

          <AkunSection
            id="preferensi"
            judul="Preferensi"
            deskripsi="Notifikasi dan tampilan aplikasi."
          >
            <SegeraHadir teks="Pengaturan preferensi akan tersedia di bagian ini." />
          </AkunSection>

          <AkunSection
            id="privasi"
            judul="Privasi & Data"
            deskripsi="Perlindungan data anak dan kontrol datamu."
          >
            <PersetujuanOrtu />
          </AkunSection>
        </div>
      </div>
    </AppShell>
  );
}
