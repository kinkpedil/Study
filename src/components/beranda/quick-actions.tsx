import Link from "next/link";
import { Sparkles, HelpCircle, Library, MessagesSquare } from "lucide-react";

import { quickActions } from "@/lib/mock/beranda";

const iconMap = {
  sparkles: Sparkles,
  "help-circle": HelpCircle,
  library: Library,
  "messages-square": MessagesSquare,
} as const;

export function QuickActions() {
  return (
    <section aria-label="Akses cepat">
      <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
        Akses Cepat
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quickActions.map((action) => {
          const Icon = iconMap[action.icon];
          return (
            <Link
              key={action.key}
              href={action.href}
              className="group flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-sm transition-colors hover:border-primary/40 hover:bg-accent/40"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">
                  {action.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
