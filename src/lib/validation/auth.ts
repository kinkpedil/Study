import { z } from "zod";

/** Pendaftaran pengguna baru; jenjang & kelas wajib untuk siswa. */
export const daftarSchema = z
  .object({
    nama: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(200),
    password: z.string().min(8).max(200),
    role: z.enum(["siswa", "guru", "admin"]),
    sekolah: z.string().trim().min(1).max(150),
    jenjang: z.enum(["SD", "SMP", "SMA"]).optional(),
    kelas: z.string().trim().max(20).optional(),
  })
  .refine((v) => v.role !== "siswa" || !!v.jenjang, {
    message: "Jenjang wajib untuk siswa.",
    path: ["jenjang"],
  });

export type DaftarInput = z.infer<typeof daftarSchema>;

/** Kredensial masuk. */
export const masukSchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(1).max(200),
});

export type MasukInput = z.infer<typeof masukSchema>;
