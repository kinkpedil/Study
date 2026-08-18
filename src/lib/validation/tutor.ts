import { z } from "zod";

/** Parameter membuka sesi Tutor AI baru. */
export const buatSesiTutorSchema = z.object({
  mapel: z.string().trim().min(1).max(60),
  jenjang: z.enum(["SD", "SMP", "SMA"]).optional(),
  // Judul opsional; bila kosong diambil dari pertanyaan pertama.
  judul: z.string().trim().min(1).max(120).optional(),
  // Pertanyaan pembuka opsional (siswa bisa memulai dari topik cepat).
  pertanyaan: z.string().trim().min(1).max(2000).optional(),
});

export type BuatSesiTutorInput = z.infer<typeof buatSesiTutorSchema>;

/** Parameter mengirim pesan siswa ke dalam sesi. */
export const pesanTutorSchema = z.object({
  isi: z.string().trim().min(1).max(2000),
});

export type PesanTutorInput = z.infer<typeof pesanTutorSchema>;
