"use client";

import Link from "next/link";
import { History } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useRole } from "@/components/role/role-context";

/** Aksi header Akun: admin dapat membuka catatan aktivitas (audit log). */
export function AkunHeaderActions() {
  const { role } = useRole();
  if (role !== "admin") return null;
  return (
    <Button asChild variant="outline">
      <Link href="/akun/aktivitas">
        <History className="h-4 w-4" />
        Catatan Aktivitas
      </Link>
    </Button>
  );
}
