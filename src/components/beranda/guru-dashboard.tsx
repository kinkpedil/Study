import Link from "next/link";
import {
  ClipboardPlus,
  CheckSquare,
  MessagesSquare,
  Library,
  Users,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatRow } from "./stat-row";
import { NotificationsPanel } from "./notifications-panel";
import {
  guruStats,
  guruKelas,
  guruPengumpulan,
  roleProfiles,
} from "@/lib/mock/roles";

const quickActions = [
  { label: "Buat Tugas", desc: "Kirim ke kelas / murid", href: "/tugas/baru", icon: ClipboardPlus },
  { label: "Nilai Tugas", desc: "23 menunggu", href: "/tugas/penilaian", icon: CheckSquare },
  { label: "Forum", desc: "Ruang sekolah", href: "/forum", icon: MessagesSquare },
  { label: "Perpustakaan", desc: "Cari referensi", href: "/perpustakaan", icon: Library },
];

export function GuruDashboard() {
  const profile = roleProfiles.guru;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-br from-primary to-primary/70 p-6 text-primary-foreground shadow-sm md:p-8">
        <p className="text-sm text-primary-foreground/80">Selamat mengajar,</p>
        <h1 className="text-xl font-bold md:text-2xl">{profile.name}</h1>
        <p className="mt-1 text-sm text-primary-foreground/80">
          {profile.school}
        </p>
      </section>

      <StatRow items={guruStats} />

      <section aria-label="Akses cepat">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          Akses Cepat
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickActions.map((a) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.label}
                href={a.href}
                className="group flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-sm transition-colors hover:border-primary/40 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight">
                    {a.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{a.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Pengumpulan Terbaru</CardTitle>
              <Button asChild variant="ghost" size="sm" className="text-primary">
                <Link href="/tugas/penilaian">Nilai semua</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y">
                {guruPengumpulan.map((p) => (
                  <li key={p.id}>
                    <Link
                      href="/tugas/penilaian"
                      className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-accent/40"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                        {p.siswa
                          .split(" ")
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join("")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {p.siswa}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {p.tugas} · Kelas {p.kelas}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <Badge
                          variant={p.status === "terlambat" ? "warning" : "secondary"}
                        >
                          {p.status === "terlambat" ? "Terlambat" : "Baru"}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">
                          {p.timeAgo}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <NotificationsPanel />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Kelas Saya</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {guruKelas.map((k) => (
                <Link
                  key={k.id}
                  href="/kelas"
                  className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 p-3 transition-colors hover:bg-accent/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{k.nama}</p>
                    <p className="text-xs text-muted-foreground">{k.mapel}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {k.jumlahSiswa}
                    </span>
                    <Badge variant="secondary">{k.tugasAktif} tugas</Badge>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
