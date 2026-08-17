"use client";

import Link from "next/link";
import { Bell, GraduationCap, Search } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { notifications } from "@/lib/mock/beranda";
import { useRole } from "@/components/role/role-context";

function initials(name: string) {
  return name
    .split(" ")
    .filter((w) => w.length > 2) // lewati sapaan seperti "Pak"/"Ibu"
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const roleLabel: Record<string, string> = {
  siswa: "Siswa",
  guru: "Guru",
  admin: "Admin Sekolah",
};

export function Header() {
  const { profile } = useRole();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-6">
      {/* Brand kecil untuk mobile */}
      <Link href="/" className="flex items-center gap-2 md:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <GraduationCap className="h-4 w-4" />
        </div>
        <span className="text-sm font-bold">Sekolah Cerdas</span>
      </Link>

      {/* Pencarian ringkas (desktop) */}
      <Link
        href="/pencarian"
        className="ml-auto hidden w-full max-w-sm items-center gap-2 rounded-md border bg-muted/50 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted md:flex"
      >
        <Search className="h-4 w-4" />
        Cari materi, soal, buku, atau diskusi…
      </Link>

      <div className="ml-auto flex items-center gap-2 md:ml-2">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Notifikasi${unread ? `, ${unread} belum dibaca` : ""}`}
        >
          <Link href="/notifikasi">
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                {unread}
              </span>
            )}
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary">
              {initials(profile.name)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium leading-tight">{profile.name}</p>
            <div className="flex items-center gap-1">
              {profile.jenjang ? (
                <>
                  <Badge variant="smp" className="px-1.5 py-0 text-[10px]">
                    {profile.jenjang}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Kelas {profile.kelas}
                  </span>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {roleLabel[profile.role]}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
