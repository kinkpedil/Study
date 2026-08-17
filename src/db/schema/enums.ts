import { pgEnum } from "drizzle-orm/pg-core";

/** Jenjang pendidikan pengguna/konten. */
export const jenjangEnum = pgEnum("jenjang", ["SD", "SMP", "SMA"]);

/** Peran pengguna dalam aplikasi. */
export const roleEnum = pgEnum("role", ["siswa", "guru", "admin"]);

/** Jenis notifikasi yang tampil di Beranda. */
export const notifTypeEnum = pgEnum("notif_type", [
  "tugas",
  "forum",
  "pengumuman",
  "nilai",
  "sistem",
]);
