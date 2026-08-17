import { z } from "zod";

/**
 * Validasi parameter pembuatan latihan di sisi server. Membatasi nilai agar
 * aman & wajar sebelum dipakai untuk memanggil AI.
 */
export const generateLatihanSchema = z.object({
  jenjang: z.enum(["SD", "SMP", "SMA"]),
  kelas: z.string().trim().min(1).max(3),
  mapel: z.string().trim().min(1).max(60),
  topik: z.string().trim().max(120).optional(),
  kesulitan: z.enum(["mudah", "sedang", "sulit"]).default("sedang"),
  tipe: z.enum(["pilihan_ganda", "esai", "campuran"]).default("pilihan_ganda"),
  jumlah: z.number().int().min(1).max(20).default(10),
});

export type GenerateLatihanInput = z.infer<typeof generateLatihanSchema>;

/** Validasi pengiriman jawaban latihan. */
export const submitLatihanSchema = z.object({
  exerciseSetId: z.string().uuid(),
  jawaban: z
    .array(
      z.object({
        questionId: z.string().uuid(),
        jawaban: z.string().max(5000),
      }),
    )
    .min(1)
    .max(50),
});

export type SubmitLatihanInput = z.infer<typeof submitLatihanSchema>;
