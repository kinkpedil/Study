import { z } from "zod";

/** Parameter permintaan petunjuk bertahap. */
export const petunjukSchema = z.object({
  pertanyaan: z.string().trim().min(3).max(2000),
  mapel: z.string().trim().min(1).max(60),
  jenjang: z.enum(["SD", "SMP", "SMA"]),
  jumlah: z.number().int().min(2).max(5).default(3),
  fotoUrl: z.string().max(500).optional(),
});

export type PetunjukInput = z.infer<typeof petunjukSchema>;

/** Parameter tindak lanjut (klarifikasi) dalam sesi. */
export const klarifikasiSchema = z.object({
  pertanyaanAwal: z.string().trim().min(3).max(2000),
  mapel: z.string().trim().min(1).max(60),
  jenjang: z.enum(["SD", "SMP", "SMA"]),
  tindakLanjut: z.string().trim().min(1).max(1000),
});

export type KlarifikasiInput = z.infer<typeof klarifikasiSchema>;
