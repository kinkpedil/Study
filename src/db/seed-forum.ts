/**
 * Seed data pengguna + forum: 1 SD, 1 SMP, 1 SMA, dengan admin, guru, dan
 * siswa tiap jenjang, lalu ruang forum sekolah, topik & balasan, pengumuman,
 * dan pengajuan masalah.
 *
 * Pengguna dibuat lewat Supabase Auth Admin (butuh SUPABASE_SERVICE_ROLE_KEY),
 * lalu `profiles` dan data forum diisi lewat Drizzle. Idempoten: pengguna
 * dicari ulang bila sudah ada; baris lain di-skip bila sudah tersedia.
 *
 * Jalankan: `npm run db:seed:forum`
 */
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, and } from "drizzle-orm";
import { createClient } from "@supabase/supabase-js";

import * as schema from "./schema";
import {
  schools,
  profiles,
  schoolForums,
  forumThreads,
  forumPosts,
  announcements,
  complaints,
} from "./schema";

const PASSWORD = "SekolahCerdas123!";

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!dbUrl || !supaUrl || !serviceKey) {
    throw new Error(
      "Butuh DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, dan SUPABASE_SERVICE_ROLE_KEY. Lihat .env.example.",
    );
  }

  const client = postgres(dbUrl, { prepare: false });
  const db = drizzle(client, { schema, casing: "snake_case" });
  const supabase = createClient(supaUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  /* --- Pengguna (Supabase Auth) --- */
  async function pastikanUser(email: string, meta: Record<string, unknown>) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: meta,
    });
    if (!error && data.user) return data.user.id;
    // Sudah ada — cari id-nya.
    const { data: list } = await supabase.auth.admin.listUsers();
    const found = list?.users.find((u) => u.email === email);
    if (!found) throw new Error(`Gagal membuat/menemukan user ${email}`);
    return found.id;
  }

  /* --- Sekolah (idempoten by name) --- */
  async function pastikanSekolah(name: string) {
    const ada = await db
      .select({ id: schools.id })
      .from(schools)
      .where(eq(schools.name, name))
      .limit(1);
    if (ada[0]) return ada[0].id;
    const [row] = await db
      .insert(schools)
      .values({ name })
      .returning({ id: schools.id });
    return row.id;
  }

  console.log("Seeding sekolah…");
  const sdId = await pastikanSekolah("SD Negeri 1 Cerdas");
  const smpId = await pastikanSekolah("SMP Negeri 1 Cerdas");
  const smaId = await pastikanSekolah("SMA Negeri 1 Cerdas");

  console.log("Seeding pengguna + profil…");
  const orang = [
    { email: "admin.smp@sekolahcerdas.id", nama: "Ibu Rina Wijaya", role: "admin" as const, jenjang: null, kelas: null, schoolId: smpId },
    { email: "guru.smp@sekolahcerdas.id", nama: "Pak Bagus Santoso", role: "guru" as const, jenjang: null, kelas: null, schoolId: smpId },
    { email: "siswa.sd@sekolahcerdas.id", nama: "Kenzie Alfaro", role: "siswa" as const, jenjang: "SD" as const, kelas: "4", schoolId: sdId },
    { email: "siswa.smp@sekolahcerdas.id", nama: "Aisyah Putri", role: "siswa" as const, jenjang: "SMP" as const, kelas: "8B", schoolId: smpId },
    { email: "siswa.sma@sekolahcerdas.id", nama: "Rangga Saputra", role: "siswa" as const, jenjang: "SMA" as const, kelas: "10", schoolId: smaId },
  ];

  const idByEmail = new Map<string, string>();
  for (const o of orang) {
    const uid = await pastikanUser(o.email, { full_name: o.nama, role: o.role });
    idByEmail.set(o.email, uid);
    await db
      .insert(profiles)
      .values({
        id: uid,
        schoolId: o.schoolId,
        fullName: o.nama,
        role: o.role,
        jenjang: o.jenjang,
        kelas: o.kelas,
      })
      .onConflictDoNothing({ target: profiles.id });
  }

  const adminId = idByEmail.get("admin.smp@sekolahcerdas.id")!;
  const guruId = idByEmail.get("guru.smp@sekolahcerdas.id")!;
  const siswaSmpId = idByEmail.get("siswa.smp@sekolahcerdas.id")!;

  /* --- Ruang forum sekolah SMP --- */
  console.log("Seeding forum sekolah…");
  async function pastikanSchoolForum(schoolId: string, name: string) {
    const ada = await db
      .select({ id: schoolForums.id })
      .from(schoolForums)
      .where(
        and(eq(schoolForums.schoolId, schoolId), eq(schoolForums.name, name)),
      )
      .limit(1);
    if (ada[0]) return ada[0].id;
    const [row] = await db
      .insert(schoolForums)
      .values({ schoolId, name, createdByProfileId: adminId })
      .returning({ id: schoolForums.id });
    return row.id;
  }
  const forumSmp = await pastikanSchoolForum(smpId, "Forum SMP Negeri 1 Cerdas");

  /* --- Topik & balasan (idempoten by title) --- */
  async function pastikanThread(v: typeof forumThreads.$inferInsert) {
    const ada = await db
      .select({ id: forumThreads.id })
      .from(forumThreads)
      .where(eq(forumThreads.title, v.title))
      .limit(1);
    if (ada[0]) return ada[0].id;
    const [row] = await db
      .insert(forumThreads)
      .values(v)
      .returning({ id: forumThreads.id });
    return row.id;
  }

  console.log("Seeding topik & balasan…");
  const thJenjang = await pastikanThread({
    authorProfileId: siswaSmpId,
    scope: "jenjang",
    audienceJenjang: "SMP",
    category: "Matematika",
    title: "Cara cepat memahami persamaan linear satu variabel?",
    body: "Aku masih bingung membedakan langkah memindahkan ruas. Ada tips?",
  });
  const thUmum = await pastikanThread({
    authorProfileId: guruId,
    scope: "umum",
    audienceJenjang: null,
    category: "Tips Belajar",
    title: "Rutinitas belajar yang efektif menurut kalian?",
    body: "Diskusi lintas jenjang: bagaimana kalian mengatur waktu belajar?",
  });

  // Balasan hanya di-seed bila thread belum punya balasan.
  const adaBalasan = await db
    .select({ id: forumPosts.id })
    .from(forumPosts)
    .where(eq(forumPosts.threadId, thJenjang))
    .limit(1);
  if (!adaBalasan[0]) {
    await db.insert(forumPosts).values([
      {
        threadId: thJenjang,
        authorProfileId: guruId,
        content:
          "Kuncinya: operasi yang sama dilakukan di kedua ruas — bayangkan timbangan yang harus seimbang.",
      },
      {
        threadId: thUmum,
        authorProfileId: siswaSmpId,
        content: "Aku belajar bertahap dari jauh hari, jadi tidak menumpuk.",
      },
    ]);
  }

  /* --- Pengumuman & pengaduan --- */
  console.log("Seeding pengumuman & pengaduan…");
  const adaPengumuman = await db
    .select({ id: announcements.id })
    .from(announcements)
    .where(eq(announcements.schoolForumId, forumSmp))
    .limit(1);
  if (!adaPengumuman[0]) {
    await db.insert(announcements).values({
      schoolForumId: forumSmp,
      title: "Ujian Tengah Semester dimulai 25 Agustus 2026",
      body: "Seluruh siswa diharapkan mempersiapkan diri. Jadwal dibagikan wali kelas.",
      createdByProfileId: adminId,
    });
  }

  const adaPengaduan = await db
    .select({ id: complaints.id })
    .from(complaints)
    .where(eq(complaints.schoolForumId, forumSmp))
    .limit(1);
  if (!adaPengaduan[0]) {
    await db.insert(complaints).values({
      schoolForumId: forumSmp,
      studentProfileId: siswaSmpId,
      title: "AC di kelas 8B mati",
      description: "Sudah dua hari AC tidak menyala, kelas terasa panas.",
      visibility: "publik",
      status: "diproses",
      handledByProfileId: adminId,
    });
  }

  console.log(
    `Selesai. Pengguna contoh (password: ${PASSWORD}):\n` +
      orang.map((o) => `  - ${o.email} (${o.role})`).join("\n"),
  );
  await client.end();
}

main().catch((err) => {
  console.error("Seed forum gagal:", err);
  process.exit(1);
});
