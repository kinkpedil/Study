/**
 * Riwayat latihan tiruan untuk rekap nilai & grafik progres. Nanti diganti
 * data dari server (tabel attempts).
 */

export interface RiwayatItem {
  id: string;
  tanggal: string; // ISO
  judul: string;
  mapel: string;
  nilai: number; // 0-100
  benar: number;
  total: number;
}

export const riwayatLatihan: RiwayatItem[] = [
  { id: "h1", tanggal: "2026-07-28", judul: "Bilangan Bulat", mapel: "Matematika", nilai: 60, benar: 6, total: 10 },
  { id: "h2", tanggal: "2026-08-02", judul: "Pecahan", mapel: "Matematika", nilai: 70, benar: 7, total: 10 },
  { id: "h3", tanggal: "2026-08-05", judul: "Sistem Pencernaan", mapel: "IPA", nilai: 65, benar: 13, total: 20 },
  { id: "h4", tanggal: "2026-08-09", judul: "Teks Deskripsi", mapel: "Bahasa Indonesia", nilai: 90, benar: 9, total: 10 },
  { id: "h5", tanggal: "2026-08-12", judul: "Aljabar Dasar", mapel: "Matematika", nilai: 80, benar: 8, total: 10 },
  { id: "h6", tanggal: "2026-08-14", judul: "Gaya dan Gerak", mapel: "IPA", nilai: 75, benar: 15, total: 20 },
  { id: "h7", tanggal: "2026-08-16", judul: "Persamaan Linear", mapel: "Matematika", nilai: 90, benar: 9, total: 10 },
];

export interface RiwayatRingkas {
  totalLatihan: number;
  rataRata: number;
  nilaiTertinggi: number;
  trenPersen: number; // selisih rata-rata paruh akhir vs paruh awal
}

export function ringkasRiwayat(items: RiwayatItem[]): RiwayatRingkas {
  if (items.length === 0) {
    return { totalLatihan: 0, rataRata: 0, nilaiTertinggi: 0, trenPersen: 0 };
  }
  const rataRata = Math.round(
    items.reduce((a, b) => a + b.nilai, 0) / items.length,
  );
  const nilaiTertinggi = Math.max(...items.map((i) => i.nilai));

  const mid = Math.floor(items.length / 2);
  const awal = items.slice(0, mid);
  const akhir = items.slice(mid);
  const avg = (arr: RiwayatItem[]) =>
    arr.length ? arr.reduce((a, b) => a + b.nilai, 0) / arr.length : 0;
  const trenPersen = Math.round(avg(akhir) - avg(awal));

  return { totalLatihan: items.length, rataRata, nilaiTertinggi, trenPersen };
}

/** Rata-rata nilai per mata pelajaran. */
export function rataRataPerMapel(
  items: RiwayatItem[],
): { mapel: string; rata: number; jumlah: number }[] {
  const map = new Map<string, { sum: number; n: number }>();
  for (const i of items) {
    const cur = map.get(i.mapel) ?? { sum: 0, n: 0 };
    cur.sum += i.nilai;
    cur.n += 1;
    map.set(i.mapel, cur);
  }
  return [...map.entries()].map(([mapel, v]) => ({
    mapel,
    rata: Math.round(v.sum / v.n),
    jumlah: v.n,
  }));
}
