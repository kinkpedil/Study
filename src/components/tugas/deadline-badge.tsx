import { Clock, AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";
import { sisaTenggat } from "@/lib/mock/tugas";

/**
 * Penanda tenggat visual dengan warna urgensi:
 * merah = lewat, kuning = mendesak (≤3 hari), abu = masih lama.
 */
export function DeadlineBadge({
  tenggat,
  className,
}: {
  tenggat: string;
  className?: string;
}) {
  const sisa = sisaTenggat(tenggat);
  const Icon = sisa.lewat ? AlertTriangle : Clock;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        sisa.lewat
          ? "text-destructive"
          : sisa.mendesak
            ? "text-warning"
            : "text-muted-foreground",
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {sisa.teks}
    </span>
  );
}
