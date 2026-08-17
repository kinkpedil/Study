import Link from "next/link";
import {
  ClipboardList,
  Megaphone,
  Star,
  MessagesSquare,
  type LucideIcon,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { notifications, type NotifKind } from "@/lib/mock/beranda";

const kindMeta: Record<NotifKind, { icon: LucideIcon; className: string }> = {
  tugas: { icon: ClipboardList, className: "bg-smp/15 text-smp" },
  pengumuman: { icon: Megaphone, className: "bg-warning/20 text-warning" },
  nilai: { icon: Star, className: "bg-success/15 text-success" },
  forum: { icon: MessagesSquare, className: "bg-primary/10 text-primary" },
};

export function NotificationsPanel() {
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <CardTitle>Notifikasi &amp; Pengumuman</CardTitle>
          {unread > 0 && (
            <Badge variant="destructive" aria-label={`${unread} belum dibaca`}>
              {unread} baru
            </Badge>
          )}
        </div>
        <Button asChild variant="ghost" size="sm" className="text-primary">
          <Link href="/notifikasi">Lihat semua</Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y">
          {notifications.map((n) => {
            const { icon: Icon, className } = kindMeta[n.kind];
            return (
              <li key={n.id}>
                <Link
                  href={n.href}
                  className={cn(
                    "relative flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:bg-accent/40",
                    !n.read && "bg-primary/[0.04]",
                  )}
                >
                  {/* Penanda garis kiri untuk item yang belum dibaca */}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute left-0 h-9 w-1 rounded-r-full",
                      !n.read ? "bg-primary" : "bg-transparent",
                    )}
                  />
                  <span
                    className={cn(
                      "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                      className,
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p
                        className={cn(
                          "truncate text-sm",
                          n.read ? "font-medium" : "font-semibold",
                        )}
                      >
                        {n.title}
                      </p>
                      {!n.read && (
                        <span
                          className="h-2 w-2 shrink-0 rounded-full bg-primary"
                          aria-label="Belum dibaca"
                        />
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {n.body}
                    </p>
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {n.timeAgo}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
