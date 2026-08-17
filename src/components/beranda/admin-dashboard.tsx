import Link from "next/link";
import {
  MessagesSquare,
  Megaphone,
  ShieldAlert,
  ScrollText,
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
  adminStats,
  adminLaporan,
  adminAudit,
  roleProfiles,
} from "@/lib/mock/roles";

const quickActions = [
  { label: "Kelola Forum", desc: "Ruang sekolah", href: "/forum-sekolah", icon: MessagesSquare },
  { label: "Pengumuman", desc: "Buat & kirim", href: "/forum-sekolah/pengumuman", icon: Megaphone },
  { label: "Laporan", desc: "7 terbuka", href: "/moderasi", icon: ShieldAlert },
  { label: "Audit Log", desc: "Aktivitas", href: "/audit", icon: ScrollText },
];

export function AdminDashboard() {
  const profile = roleProfiles.admin;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-br from-primary to-primary/70 p-6 text-primary-foreground shadow-sm md:p-8">
        <p className="text-sm text-primary-foreground/80">Panel admin sekolah</p>
        <h1 className="text-xl font-bold md:text-2xl">{profile.name}</h1>
        <p className="mt-1 text-sm text-primary-foreground/80">
          {profile.school}
        </p>
      </section>

      <StatRow items={adminStats} />

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
              <div className="flex items-center gap-2">
                <CardTitle>Laporan Perlu Ditinjau</CardTitle>
                <Badge variant="destructive">
                  {adminLaporan.filter((l) => l.status === "menunggu").length} menunggu
                </Badge>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-primary">
                <Link href="/moderasi">Buka moderasi</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y">
                {adminLaporan.map((l) => (
                  <li key={l.id}>
                    <Link
                      href="/moderasi"
                      className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-accent/40"
                    >
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/15 text-destructive">
                        <ShieldAlert className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {l.target}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          Alasan: {l.alasan}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <Badge
                          variant={l.status === "menunggu" ? "warning" : "secondary"}
                        >
                          {l.status === "menunggu" ? "Menunggu" : "Ditinjau"}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">
                          {l.timeAgo}
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
              <CardTitle>Aktivitas / Audit</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="relative space-y-4 border-l pl-6">
                {adminAudit.map((a) => (
                  <li key={a.id} className="relative">
                    <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full border bg-card text-primary">
                      <ScrollText className="h-3.5 w-3.5" />
                    </span>
                    <p className="text-sm font-medium leading-tight">
                      {a.aksi}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {a.aktor} · {a.timeAgo}
                    </p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
