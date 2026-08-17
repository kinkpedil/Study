import type { Jenjang } from "@/lib/mock/beranda";

/**
 * Gaya penjelasan yang disesuaikan dengan jenjang — dipakai untuk menampilkan
 * label & panduan tone, serta nanti mengarahkan prompt AI agar bahasa cocok
 * untuk usia siswa.
 */
export interface JenjangStyle {
  jenjang: Jenjang;
  label: string;
  ringkas: string;
  detail: string;
  badgeVariant: "sd" | "smp" | "sma";
}

export const jenjangStyles: Record<Jenjang, JenjangStyle> = {
  SD: {
    jenjang: "SD",
    label: "SD",
    ringkas: "Bahasa sederhana & banyak analogi",
    detail:
      "Kalimat pendek, kata sehari-hari, dan perumpamaan yang mudah dibayangkan anak.",
    badgeVariant: "sd",
  },
  SMP: {
    jenjang: "SMP",
    label: "SMP",
    ringkas: "Konsep bertahap dengan contoh",
    detail:
      "Menjelaskan konsep langkah demi langkah dengan contoh dari kehidupan sehari-hari.",
    badgeVariant: "smp",
  },
  SMA: {
    jenjang: "SMA",
    label: "SMA",
    ringkas: "Penjelasan formal & penalaran",
    detail:
      "Notasi lengkap, istilah baku, dan penalaran yang lebih mendalam sesuai tingkat SMA.",
    badgeVariant: "sma",
  },
};

export function getJenjangStyle(jenjang: Jenjang | null | undefined): JenjangStyle {
  return jenjangStyles[jenjang ?? "SMP"];
}
