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

/** Tingkat kesulitan paket latihan soal. */
export const kesulitanEnum = pgEnum("kesulitan", ["mudah", "sedang", "sulit"]);

/** Tipe soal dalam sebuah latihan. */
export const soalTipeEnum = pgEnum("soal_tipe", ["pilihan_ganda", "esai"]);

/** Pengirim pesan dalam sesi Bantuan PR. */
export const hwSenderEnum = pgEnum("hw_sender", ["siswa", "ai"]);

/** Jenis pesan dalam sesi Bantuan PR. */
export const hwMsgTipeEnum = pgEnum("hw_msg_tipe", [
  "pertanyaan",
  "petunjuk",
  "langkah",
  "jawaban",
  "klarifikasi",
]);

/** Status sesi Bantuan PR. */
export const hwStatusEnum = pgEnum("hw_status", ["berlangsung", "selesai"]);

/** Status sesi Tutor AI Pribadi. */
export const tutorStatusEnum = pgEnum("tutor_status", [
  "berlangsung",
  "selesai",
]);

/** Pengirim pesan dalam sesi Tutor AI. */
export const tutorSenderEnum = pgEnum("tutor_sender", ["siswa", "ai"]);

/** Kategori topik berisiko yang terdeteksi moderasi pada pesan tutor. */
export const tutorRiskEnum = pgEnum("tutor_risk", [
  "keselamatan_diri",
  "kekerasan",
  "konten_dewasa",
  "perundungan",
  "data_pribadi",
]);

/** Status penanganan eskalasi sesi tutor ke guru. */
export const tutorEskalasiStatusEnum = pgEnum("tutor_eskalasi_status", [
  "baru",
  "ditangani",
]);

/** Cakupan topik forum (diskusi jenjang vs forum umum). */
export const forumScopeEnum = pgEnum("forum_scope", ["jenjang", "umum"]);

/** Status moderasi sebuah postingan/topik forum. */
export const moderationStatusEnum = pgEnum("moderation_status", [
  "visible",
  "flagged",
  "removed",
]);

/** Visibilitas pengajuan masalah (pengaduan) di forum sekolah. */
export const complaintVisibilityEnum = pgEnum("complaint_visibility", [
  "privat",
  "publik",
]);

/** Status tindak lanjut pengajuan masalah. */
export const complaintStatusEnum = pgEnum("complaint_status", [
  "baru",
  "diproses",
  "selesai",
]);

/** Tipe target laporan konten. */
export const reportTargetTypeEnum = pgEnum("report_target_type", [
  "thread",
  "post",
]);

/** Alasan laporan konten. */
export const reportReasonEnum = pgEnum("report_reason", [
  "kasar",
  "sara",
  "perundungan",
  "spam",
  "doxxing",
  "berbahaya",
  "lainnya",
]);

/** Status peninjauan laporan. */
export const reportStatusEnum = pgEnum("report_status", [
  "menunggu",
  "ditangani",
  "ditolak",
]);

/** Kategori entri catatan aktivitas (audit log). */
export const auditKategoriEnum = pgEnum("audit_kategori", [
  "pengguna",
  "moderasi",
  "forum",
  "keamanan",
  "sistem",
]);

/** Status persetujuan orang tua/wali untuk akun anak. */
export const consentStatusEnum = pgEnum("consent_status", [
  "belum",
  "menunggu",
  "disetujui",
]);

/** Bentuk pengumpulan tugas. */
export const tugasTipeEnum = pgEnum("tugas_tipe", ["teks", "file"]);

/** Status pengumpulan tugas siswa. */
export const submissionStatusEnum = pgEnum("submission_status", [
  "terkumpul",
  "dinilai",
]);
