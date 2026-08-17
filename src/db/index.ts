import "server-only";

import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

type DB = PostgresJsDatabase<typeof schema>;

/**
 * Klien database Drizzle (server-only). Koneksi dibuat lazy lewat Proxy agar
 * mengimpor modul ini tidak memerlukan DATABASE_URL — koneksi baru dibuat saat
 * db pertama kali dipakai. Instance di-cache lintas hot-reload di dev.
 */
declare global {
  var __db__: DB | undefined;
}

function createDb(): DB {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL belum diset. Lihat .env.example untuk konfigurasi Supabase.",
    );
  }
  // `prepare: false` disarankan untuk Supabase connection pooler (pgbouncer).
  const client = postgres(url, { prepare: false });
  const instance = drizzle(client, { schema, casing: "snake_case" });
  if (process.env.NODE_ENV !== "production") globalThis.__db__ = instance;
  return instance;
}

function getDb(): DB {
  return globalThis.__db__ ?? createDb();
}

export const db = new Proxy({} as DB, {
  get(_target, prop) {
    const instance = getDb();
    const value = instance[prop as keyof DB];
    return typeof value === "function" ? value.bind(instance) : value;
  },
}) as DB;

export { schema };
