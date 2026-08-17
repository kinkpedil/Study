import type { Metadata } from "next";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { ForumView } from "@/components/forum/forum-view";

export const metadata: Metadata = {
  title: "Ruang Diskusi & Forum",
};

export default function ForumPage() {
  return (
    <AppShell>
      <PageHeader
        title="Ruang Diskusi & Forum"
        description="Berdiskusi sesuai jenjang, di forum umum, atau di ruang sekolahmu — aman dan terawasi."
      />
      <ForumView />
    </AppShell>
  );
}
