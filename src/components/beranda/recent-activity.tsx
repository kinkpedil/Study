import {
  Sparkles,
  HelpCircle,
  Library,
  MessagesSquare,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { recentActivity, type ActivityKind } from "@/lib/mock/beranda";

const kindIcon: Record<ActivityKind, LucideIcon> = {
  kuis: Sparkles,
  pr: HelpCircle,
  buku: Library,
  diskusi: MessagesSquare,
  tugas: ClipboardList,
};

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktivitas Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-4 border-l pl-6">
          {recentActivity.map((item) => {
            const Icon = kindIcon[item.kind];
            return (
              <li key={item.id} className="relative">
                <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full border bg-card text-primary">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <p className="text-sm font-medium leading-tight">
                  {item.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.detail} · {item.timeAgo}
                </p>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
