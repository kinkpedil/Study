import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { TutorStart } from "@/components/tutor/tutor-start";
import { TutorSessions } from "@/components/tutor/tutor-sessions";
import { NewSessionModal } from "@/components/tutor/new-session-modal";

export const metadata: Metadata = {
  title: "Tutor AI Pribadi",
};

export default function TutorPage() {
  return (
    <AppShell>
      <PageHeader
        title="Tutor AI Pribadi"
        description="Pendamping belajar pribadi yang menjelaskan dengan sabar, sesuai jenjang, dan aman untuk anak."
        action={<NewSessionModal />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <TutorStart />

          <div className="flex items-start gap-3 rounded-xl border bg-accent/30 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium">Aman & terpantau</p>
              <p className="text-sm text-muted-foreground">
                Tutor AI menyaring jawaban agar sesuai usia dan tidak memuat
                konten berbahaya. Jika kamu butuh bantuan lebih, sesi bisa
                diteruskan ke gurumu.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <TutorSessions />
        </div>
      </div>
    </AppShell>
  );
}
