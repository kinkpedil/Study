/**
 * Kumpulan soal tiruan untuk halaman "Kerjakan Soal". Nanti diganti hasil
 * generator AI. `kunci` & `pembahasan` dipakai halaman kunci/pembahasan.
 */

export interface OpsiSoal {
  id: string; // "a" | "b" | "c" | "d"
  teks: string;
}

export interface Soal {
  id: string;
  nomor: number;
  tipe: "pilihan_ganda" | "esai";
  pertanyaan: string;
  opsi?: OpsiSoal[];
  /** id opsi benar (PG) atau contoh jawaban (esai). */
  kunci: string;
  pembahasan: string;
}

export interface LatihanSet {
  id: string;
  judul: string;
  mapel: string;
  jenjang: string;
  kelas: string;
  kesulitan: string;
  soal: Soal[];
}

export const contohLatihan: LatihanSet = {
  id: "lth_demo_001",
  judul: "Latihan Aljabar & Persamaan Linear",
  mapel: "Matematika",
  jenjang: "SMP",
  kelas: "8",
  kesulitan: "sedang",
  soal: [
    {
      id: "s1",
      nomor: 1,
      tipe: "pilihan_ganda",
      pertanyaan: "Nilai x dari persamaan 2x + 5 = 15 adalah …",
      opsi: [
        { id: "a", teks: "3" },
        { id: "b", teks: "5" },
        { id: "c", teks: "7" },
        { id: "d", teks: "10" },
      ],
      kunci: "b",
      pembahasan:
        "2x + 5 = 15 → 2x = 10 → x = 5. Kurangi kedua ruas dengan 5, lalu bagi 2.",
    },
    {
      id: "s2",
      nomor: 2,
      tipe: "pilihan_ganda",
      pertanyaan: "Bentuk sederhana dari 3(x + 2) − 2x adalah …",
      opsi: [
        { id: "a", teks: "x + 6" },
        { id: "b", teks: "x + 2" },
        { id: "c", teks: "5x + 6" },
        { id: "d", teks: "x − 6" },
      ],
      kunci: "a",
      pembahasan: "3(x + 2) − 2x = 3x + 6 − 2x = x + 6.",
    },
    {
      id: "s3",
      nomor: 3,
      tipe: "pilihan_ganda",
      pertanyaan:
        "Jika 4x − 3 = 2x + 7, maka nilai x yang memenuhi adalah …",
      opsi: [
        { id: "a", teks: "2" },
        { id: "b", teks: "4" },
        { id: "c", teks: "5" },
        { id: "d", teks: "6" },
      ],
      kunci: "c",
      pembahasan: "4x − 3 = 2x + 7 → 2x = 10 → x = 5.",
    },
    {
      id: "s4",
      nomor: 4,
      tipe: "esai",
      pertanyaan:
        "Sebuah toko menjual 3 buku dan 2 pena seharga Rp23.000, sedangkan 2 buku dan 4 pena seharga Rp22.000. Jelaskan langkah mencari harga satu buku.",
      kunci:
        "Susun SPLDV: 3b + 2p = 23000 dan 2b + 4p = 22000, lalu eliminasi/substitusi hingga diperoleh b = 6000.",
      pembahasan:
        "Misal b = harga buku, p = harga pena. 3b + 2p = 23000 dan 2b + 4p = 22000. Kalikan persamaan pertama dengan 2: 6b + 4p = 46000. Kurangkan persamaan kedua: 4b = 24000 → b = 6000.",
    },
    {
      id: "s5",
      nomor: 5,
      tipe: "pilihan_ganda",
      pertanyaan: "Himpunan penyelesaian dari x − 4 < 1 untuk x bilangan bulat positif adalah …",
      opsi: [
        { id: "a", teks: "{1, 2, 3, 4}" },
        { id: "b", teks: "{1, 2, 3}" },
        { id: "c", teks: "{1, 2, 3, 4, 5}" },
        { id: "d", teks: "{5, 6, 7}" },
      ],
      kunci: "a",
      pembahasan: "x − 4 < 1 → x < 5. Bilangan bulat positif < 5: {1, 2, 3, 4}.",
    },
  ],
};

/** Kunci penyimpanan lokal jawaban per set latihan. */
export function jawabanStorageKey(latihanId: string) {
  return `sekolah-cerdas:latihan:${latihanId}:jawaban`;
}
