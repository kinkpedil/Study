import type { AkunSectionId } from "@/lib/mock/akun";

/**
 * Pembungkus satu bagian pada halaman Akun: id anchor + judul + deskripsi,
 * lalu konten. Dipakai konsisten oleh tiap bagian (profil, keamanan, dll).
 */
export function AkunSection({
  id,
  judul,
  deskripsi,
  children,
}: {
  id: AkunSectionId;
  judul: string;
  deskripsi?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 space-y-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{judul}</h2>
        {deskripsi && (
          <p className="text-sm text-muted-foreground">{deskripsi}</p>
        )}
      </div>
      {children}
    </section>
  );
}
