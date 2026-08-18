import { z } from "zod";

/** Validasi pembuatan topik forum. */
export const createThreadSchema = z.object({
  scope: z.enum(["jenjang", "umum"]),
  audienceJenjang: z.enum(["SD", "SMP", "SMA"]).optional(),
  category: z.string().trim().min(1).max(60),
  title: z.string().trim().min(5).max(200),
  body: z.string().trim().min(1).max(5000),
});

export type CreateThreadInput = z.infer<typeof createThreadSchema>;

/** Validasi pembuatan balasan. */
export const createPostSchema = z.object({
  content: z.string().trim().min(1).max(5000),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
