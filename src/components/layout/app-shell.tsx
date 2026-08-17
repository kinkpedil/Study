import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { MobileNav } from "./mobile-nav";

/**
 * Kerangka aplikasi: sidebar (desktop), header sticky, dan bottom nav (mobile).
 * Dipakai bersama oleh semua halaman di dalam grup (app).
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 px-4 pb-24 pt-6 md:px-6 md:pb-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
