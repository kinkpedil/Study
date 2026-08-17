/**
 * Percakapan Bantuan PR tiruan — pertanyaan siswa + rangkaian petunjuk
 * bertahap (bukan jawaban langsung) + langkah penyelesaian. Nanti diganti
 * hasil AI (homework_messages).
 */

export interface Percakapan {
  id: string;
  judul: string;
  mapel: string;
  jenjang: string;
  pertanyaan: string;
  /** Petunjuk berurutan; diungkap satu per satu. */
  petunjuk: string[];
  /** Langkah penyelesaian akhir (diungkap setelah semua petunjuk). */
  langkahFinal: string[];
}

const data: Record<string, Percakapan> = {
  hs_1: {
    id: "hs_1",
    judul: "Menyederhanakan pecahan aljabar",
    mapel: "Matematika",
    jenjang: "SMP",
    pertanyaan: "Bagaimana cara menyederhanakan (x² − 4)/(x + 2)?",
    petunjuk: [
      "Perhatikan bagian pembilang x² − 4. Bentuk ini termasuk pola khusus. Pola apa yang kamu kenal untuk a² − b²?",
      "Betul, itu selisih dua kuadrat: a² − b² = (a − b)(a + b). Coba tuliskan x² − 4 sebagai perkalian dua faktor.",
      "Setelah pembilang menjadi (x − 2)(x + 2), lihat apakah ada faktor yang sama dengan penyebut (x + 2). Faktor yang sama bisa kamu coret.",
    ],
    langkahFinal: [
      "x² − 4 = (x − 2)(x + 2)  (selisih dua kuadrat).",
      "Tulis ulang: (x − 2)(x + 2) / (x + 2).",
      "Coret faktor (x + 2) yang sama di atas dan bawah.",
      "Hasil: x − 2, dengan syarat x ≠ −2.",
    ],
  },
  hs_2: {
    id: "hs_2",
    judul: "Hukum Newton pada bidang miring",
    mapel: "Fisika",
    jenjang: "SMP",
    pertanyaan: "Kenapa benda bisa meluncur turun di bidang miring?",
    petunjuk: [
      "Gaya apa saja yang bekerja pada benda di bidang miring? Coba sebutkan tiga gaya utama.",
      "Gaya berat bisa diuraikan menjadi dua komponen: tegak lurus bidang dan sejajar bidang. Komponen mana yang menarik benda meluncur turun?",
      "Bandingkan komponen berat yang sejajar bidang dengan gaya gesek. Kapan benda mulai meluncur?",
    ],
    langkahFinal: [
      "Gaya yang bekerja: berat (w), gaya normal (N), dan gaya gesek (f).",
      "Uraikan berat: w sin θ (sejajar bidang) dan w cos θ (tegak lurus bidang).",
      "Komponen w sin θ menarik benda turun; gesek f menahannya.",
      "Benda meluncur ketika w sin θ > f (gaya gesek statis maksimum).",
    ],
  },
};

const fallback: Percakapan = {
  id: "baru",
  judul: "Bantuan PR",
  mapel: "Umum",
  jenjang: "SMP",
  pertanyaan: "Pertanyaanmu akan tampil di sini.",
  petunjuk: [
    "AI akan memulai dengan pertanyaan pemantik untuk mengecek pemahamanmu.",
    "Lalu memberi petunjuk kedua yang mengarahkan ke konsep kuncinya.",
    "Petunjuk terakhir mendekatkanmu ke langkah penyelesaian tanpa memberi jawaban.",
  ],
  langkahFinal: [
    "Langkah penyelesaian lengkap tampil setelah kamu mencoba semua petunjuk.",
  ],
};

export function getPercakapan(id: string): Percakapan {
  return data[id] ?? { ...fallback, id };
}
