import { z } from "zod";

/** Pembaruan profil yang diizinkan pengguna (nama & kelas). */
export const updateProfilSchema = z.object({
  nama: z.string().trim().min(2).max(100).optional(),
  kelas: z.string().trim().max(20).optional(),
});

export type UpdateProfilInput = z.infer<typeof updateProfilSchema>;

/** Satu preferensi/izin: kunci slug + status aktif. */
export const preferensiSchema = z.object({
  preferensi: z
    .array(
      z.object({
        key: z
          .string()
          .trim()
          .min(1)
          .max(40)
          .regex(/^[a-z0-9_]+$/, "Kunci harus huruf kecil/angka/underscore."),
        aktif: z.boolean(),
      }),
    )
    .min(1)
    .max(30),
});

export type PreferensiInput = z.infer<typeof preferensiSchema>;
