import { defineConfig } from "drizzle-kit";

/**
 * Konfigurasi Drizzle Kit untuk skema & migrasi PostgreSQL (Supabase).
 * DATABASE_URL diambil dari environment (lihat .env.example).
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  casing: "snake_case",
  verbose: true,
  strict: true,
});
