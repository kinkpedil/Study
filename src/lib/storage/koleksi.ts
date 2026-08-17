/**
 * Penyimpanan lokal untuk "Koleksi Tersimpan" perpustakaan — menyimpan id buku
 * favorit di localStorage. Sementara sampai backend (tabel saved_books) siap.
 *
 * Perubahan menyiarkan event `koleksi-change` agar komponen di halaman yang
 * sama tetap sinkron tanpa reload.
 */

const KEY = "sekolah-cerdas:perpustakaan:koleksi";
export const KOLEKSI_EVENT = "koleksi-change";

function hasWindow() {
  return typeof window !== "undefined";
}

export function loadKoleksi(): string[] {
  if (!hasWindow()) return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function isSaved(id: string): boolean {
  return loadKoleksi().includes(id);
}

function simpan(ids: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent(KOLEKSI_EVENT));
  } catch {
    /* penyimpanan penuh / tidak tersedia */
  }
}

/** Menambah/menghapus buku dari koleksi. Mengembalikan status tersimpan baru. */
export function toggleKoleksi(id: string): boolean {
  if (!hasWindow()) return false;
  const ids = loadKoleksi();
  const ada = ids.includes(id);
  simpan(ada ? ids.filter((x) => x !== id) : [id, ...ids]);
  return !ada;
}

export function hapusKoleksi(id: string) {
  if (!hasWindow()) return;
  simpan(loadKoleksi().filter((x) => x !== id));
}
