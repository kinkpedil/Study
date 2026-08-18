"use client";

import Link from "next/link";
import { LifeBuoy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useRole } from "@/components/role/role-context";
import { NewSessionModal } from "./new-session-modal";

/** Aksi header Tutor AI: siswa memulai sesi; guru melihat eskalasi masuk. */
export function TutorHeaderActions() {
  const { profile } = useRole();
  if (profile.role !== "siswa") {
    return (
      <Button asChild variant="outline">
        <Link href="/tutor/eskalasi">
          <LifeBuoy className="h-4 w-4" />
          Permintaan Bantuan
        </Link>
      </Button>
    );
  }
  return <NewSessionModal />;
}
