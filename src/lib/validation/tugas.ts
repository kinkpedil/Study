import { z } from "zod";

/** Validasi pembuatan/pengiriman tugas ke kelas. */
export const createTugasSchema = z.object({
  classId: z.string().uuid(),
  title: z.string().trim().min(5).max(200),
  description: z.string().trim().max(5000).optional(),
  dueDate: z.string().datetime(),
  submissionType: z.enum(["teks", "file"]).default("teks"),
});

export type CreateTugasInput = z.infer<typeof createTugasSchema>;

/** Validasi pengumpulan jawaban siswa. */
export const submitTugasSchema = z
  .object({
    content: z.string().trim().max(20000).optional(),
    fileUrl: z.string().max(500).optional(),
  })
  .refine((v) => (v.content?.trim() || v.fileUrl), {
    message: "Jawaban teks atau file wajib diisi.",
  });

export type SubmitTugasInput = z.infer<typeof submitTugasSchema>;

/** Validasi penilaian oleh guru. */
export const gradeTugasSchema = z.object({
  grade: z.number().int().min(0).max(100),
  feedback: z.string().trim().max(2000).optional(),
});

export type GradeTugasInput = z.infer<typeof gradeTugasSchema>;
