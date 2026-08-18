import "server-only";

import { getCurrentProfile } from "@/lib/auth";
import { getRingkasanProgres, type PenguasaanMapel } from "@/server/progres";

/**
 * Rekomendasi materi/latihan personal untuk Tutor AI. Deterministik dari
 * progres belajar (learning_progress): mapel dengan penguasaan terendah
 * diprioritaskan untuk latihan, lalu materi pendukung. Bila belum ada data
 * progres, dipakai rekomendasi awal sesuai jenjang.
 */

export type RekomendasiTipe = "materi" | "latihan" | "video";

export interface RekomendasiMateri {
  id: string;
  judul: string;
  mapel: string;
  tipe: RekomendasiTipe;
  alasan: string;
  href: string;
}

/** Href latihan baru dengan mapel terisi awal. */
function hrefLatihan(mapel: string): string {
  return `/latihan/baru?mapel=${encodeURIComponent(mapel)}`;
}

/** Href pencarian perpustakaan untuk mapel terkait. */
function hrefMateri(mapel: string): string {
  return `/perpustakaan?q=${encodeURIComponent(mapel)}`;
}

/** Rekomendasi awal saat belum ada progres, disesuaikan jenjang. */
function rekomendasiAwal(jenjang: string | null): RekomendasiMateri[] {
  const mapel =
    jenjang === "SD"
      ? ["Matematika", "Bahasa Indonesia"]
      : jenjang === "SMA"
        ? ["Matematika", "Fisika"]
        : ["Matematika", "IPA"];
  return [
    {
      id: `awal-${mapel[0]}`,
      judul: `Mulai latihan ${mapel[0]}`,
      mapel: mapel[0],
      tipe: "latihan",
      alasan: "Kerjakan latihan pertama agar kami bisa menyarankan yang pas untukmu.",
      href: hrefLatihan(mapel[0]),
    },
    {
      id: `awal-materi-${mapel[1]}`,
      judul: `Jelajahi materi ${mapel[1]}`,
      mapel: mapel[1],
      tipe: "materi",
      alasan: "Baca materi dasar untuk memperkuat pemahamanmu.",
      href: hrefMateri(mapel[1]),
    },
  ];
}

/** Satu rekomendasi latihan untuk mapel yang penguasaannya masih rendah. */
function rekLatihan(p: PenguasaanMapel): RekomendasiMateri {
  const nilai = p.rataRataNilai;
  const alasan =
    nilai !== null
      ? `Nilai ${p.mapel}-mu ${nilai}% — latih lagi biar makin paham.`
      : `Penguasaan ${p.mapel} masih ${p.masteryPercent}% — yuk perkuat.`;
  return {
    id: `latihan-${p.mapel}`,
    judul: `Latihan ${p.mapel}`,
    mapel: p.mapel,
    tipe: "latihan",
    alasan,
    href: hrefLatihan(p.mapel),
  };
}

/** Satu rekomendasi materi untuk mapel yang sudah mulai dikuasai. */
function rekMateri(p: PenguasaanMapel): RekomendasiMateri {
  return {
    id: `materi-${p.mapel}`,
    judul: `Materi ${p.mapel}`,
    mapel: p.mapel,
    tipe: "materi",
    alasan: `Lanjutkan momentum ${p.mapel}-mu (penguasaan ${p.masteryPercent}%).`,
    href: hrefMateri(p.mapel),
  };
}

/**
 * Menyusun rekomendasi untuk siswa: latihan pada mapel terlemah + materi pada
 * mapel terkuat. Dibatasi `limit` item.
 */
export async function getRekomendasiMateri(
  profileId: string,
  jenjang: string | null,
  limit = 3,
): Promise<RekomendasiMateri[]> {
  const progres = await getRingkasanProgres(profileId);
  if (progres.penguasaanMapel.length === 0) {
    return rekomendasiAwal(jenjang).slice(0, limit);
  }

  const urut = [...progres.penguasaanMapel].sort(
    (a, b) => a.masteryPercent - b.masteryPercent,
  );
  const terlemah = urut.slice(0, 2);
  const terkuat = urut[urut.length - 1];

  const hasil: RekomendasiMateri[] = terlemah.map(rekLatihan);
  // Tambah materi mapel terkuat bila berbeda dari yang sudah masuk.
  if (terkuat && !terlemah.some((p) => p.mapel === terkuat.mapel)) {
    hasil.push(rekMateri(terkuat));
  }
  return hasil.slice(0, limit);
}

/** Varian yang mengambil profil pengguna login sendiri (dipakai route). */
export async function getRekomendasiUntukSaya(): Promise<RekomendasiMateri[] | null> {
  const profil = await getCurrentProfile();
  if (!profil) return null;
  return getRekomendasiMateri(profil.id, profil.jenjang);
}
