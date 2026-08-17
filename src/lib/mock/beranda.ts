/**
 * Data tiruan (mock) untuk halaman Beranda.
 * Dipakai sementara sampai backend/Supabase tersedia. Struktur menyerupai
 * kontrak API yang direncanakan agar mudah diganti dengan data asli nanti.
 */

export type Jenjang = "SD" | "SMP" | "SMA";

export interface CurrentUser {
  id: string;
  name: string;
  role: "siswa" | "guru" | "admin";
  jenjang: Jenjang;
  kelas: string;
  school: string;
  avatarUrl?: string;
}

export const currentUser: CurrentUser = {
  id: "usr_01",
  name: "Aisyah Putri",
  role: "siswa",
  jenjang: "SMP",
  kelas: "8B",
  school: "SMP Negeri 1 Cerdas",
};

export interface ProgressStat {
  /** Nilai minggu ini. */
  nilai: number;
  /** Selisih terhadap minggu lalu (bisa negatif). */
  delta: number;
}

export interface ProgressSummary {
  mingguIni: {
    soalDikerjakan: ProgressStat;
    menitBelajar: ProgressStat;
    rataRataNilai: ProgressStat;
    streakHari: ProgressStat;
  };
  targetMingguan: {
    tercapai: number;
    total: number;
  };
  penguasaanMapel: {
    mapel: string;
    persen: number;
  }[];
}

export const progressSummary: ProgressSummary = {
  mingguIni: {
    soalDikerjakan: { nilai: 84, delta: 12 },
    menitBelajar: { nilai: 315, delta: -20 },
    rataRataNilai: { nilai: 87, delta: 4 },
    streakHari: { nilai: 6, delta: 1 },
  },
  targetMingguan: {
    tercapai: 5,
    total: 7,
  },
  penguasaanMapel: [
    { mapel: "Matematika", persen: 78 },
    { mapel: "IPA", persen: 65 },
    { mapel: "Bahasa Indonesia", persen: 91 },
    { mapel: "IPS", persen: 54 },
  ],
};

export interface QuizScore {
  id: string;
  judul: string;
  mapel: string;
  nilai: number;
  total: number;
  tanggal: string; // ISO
}

export const recentQuizScores: QuizScore[] = [
  {
    id: "qz_09",
    judul: "Aljabar Dasar",
    mapel: "Matematika",
    nilai: 9,
    total: 10,
    tanggal: "2026-08-16T09:20:00Z",
  },
  {
    id: "qz_08",
    judul: "Sistem Pencernaan",
    mapel: "IPA",
    nilai: 7,
    total: 10,
    tanggal: "2026-08-15T14:05:00Z",
  },
  {
    id: "qz_07",
    judul: "Teks Deskripsi",
    mapel: "Bahasa Indonesia",
    nilai: 10,
    total: 10,
    tanggal: "2026-08-14T11:40:00Z",
  },
];

export type ActivityKind =
  | "kuis"
  | "pr"
  | "buku"
  | "diskusi"
  | "tugas";

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  title: string;
  detail: string;
  timeAgo: string;
}

export const recentActivity: ActivityItem[] = [
  {
    id: "act_1",
    kind: "kuis",
    title: "Menyelesaikan kuis Aljabar Dasar",
    detail: "Nilai 90 · Matematika",
    timeAgo: "2 jam lalu",
  },
  {
    id: "act_2",
    kind: "pr",
    title: "Bertanya soal PR Fisika",
    detail: "Mendapat 3 petunjuk bertahap",
    timeAgo: "kemarin",
  },
  {
    id: "act_3",
    kind: "buku",
    title: "Menyimpan buku “IPA Terpadu Kelas 8”",
    detail: "Perpustakaan Kemendikbud",
    timeAgo: "kemarin",
  },
  {
    id: "act_4",
    kind: "diskusi",
    title: "Membalas diskusi “Cara menghafal rumus”",
    detail: "Forum SMP · 4 balasan",
    timeAgo: "2 hari lalu",
  },
];

export type QuickActionKey = "buat-soal" | "bantuan-pr" | "cari-buku" | "diskusi";

export interface QuickAction {
  key: QuickActionKey;
  label: string;
  description: string;
  href: string;
  icon: "sparkles" | "help-circle" | "library" | "messages-square";
}

export const quickActions: QuickAction[] = [
  {
    key: "buat-soal",
    label: "Buat Soal",
    description: "Latihan berbantuan AI",
    href: "/latihan/baru",
    icon: "sparkles",
  },
  {
    key: "bantuan-pr",
    label: "Bantuan PR",
    description: "Petunjuk bertahap",
    href: "/bantuan-pr",
    icon: "help-circle",
  },
  {
    key: "cari-buku",
    label: "Cari Buku",
    description: "Perpustakaan resmi",
    href: "/perpustakaan",
    icon: "library",
  },
  {
    key: "diskusi",
    label: "Diskusi",
    description: "Forum sesuai jenjang",
    href: "/forum",
    icon: "messages-square",
  },
];

export type NotifKind = "tugas" | "forum" | "pengumuman" | "nilai";

export interface NotificationItem {
  id: string;
  kind: NotifKind;
  title: string;
  body: string;
  timeAgo: string;
  read: boolean;
  href: string;
}

export const notifications: NotificationItem[] = [
  {
    id: "ntf_1",
    kind: "tugas",
    title: "Tugas Matematika akan tenggat",
    body: "“Latihan Persamaan Linear” tenggat besok 23.59.",
    timeAgo: "1 jam lalu",
    read: false,
    href: "/tugas",
  },
  {
    id: "ntf_2",
    kind: "pengumuman",
    title: "Pengumuman Sekolah",
    body: "Ujian tengah semester dimulai 25 Agustus 2026.",
    timeAgo: "5 jam lalu",
    read: false,
    href: "/forum-sekolah",
  },
  {
    id: "ntf_3",
    kind: "nilai",
    title: "Nilai kuis keluar",
    body: "Kuis “Sistem Pencernaan” mendapat nilai 70.",
    timeAgo: "kemarin",
    read: true,
    href: "/latihan/riwayat",
  },
  {
    id: "ntf_4",
    kind: "forum",
    title: "Balasan baru di diskusimu",
    body: "Budi membalas “Cara menghafal rumus”.",
    timeAgo: "kemarin",
    read: true,
    href: "/forum",
  },
];

export type SearchType = "materi" | "soal" | "buku" | "diskusi";

export interface SearchSuggestion {
  id: string;
  label: string;
  type: SearchType;
}

export const searchSuggestions: SearchSuggestion[] = [
  { id: "s1", label: "Persamaan linear satu variabel", type: "materi" },
  { id: "s2", label: "Latihan pecahan kelas 8", type: "soal" },
  { id: "s3", label: "IPA Terpadu Kelas 8", type: "buku" },
  { id: "s4", label: "Cara menghafal rumus", type: "diskusi" },
];

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: SearchType;
  href: string;
}

/** Indeks pencarian tiruan — nanti diganti pencarian server-side. */
export const searchIndex: SearchResult[] = [
  {
    id: "r1",
    title: "Persamaan Linear Satu Variabel",
    subtitle: "Materi · Matematika · Kelas 8",
    type: "materi",
    href: "/materi/persamaan-linear",
  },
  {
    id: "r2",
    title: "Latihan Pecahan & Desimal",
    subtitle: "Paket soal · 10 soal · Matematika",
    type: "soal",
    href: "/latihan/pecahan",
  },
  {
    id: "r3",
    title: "Latihan Aljabar Dasar",
    subtitle: "Paket soal · 12 soal · Matematika",
    type: "soal",
    href: "/latihan/aljabar-dasar",
  },
  {
    id: "r4",
    title: "IPA Terpadu Kelas 8",
    subtitle: "Buku paket · Kemendikbud",
    type: "buku",
    href: "/perpustakaan/ipa-terpadu-8",
  },
  {
    id: "r5",
    title: "Matematika untuk SMP Kelas 8",
    subtitle: "Buku paket · Kemendikbud",
    type: "buku",
    href: "/perpustakaan/matematika-smp-8",
  },
  {
    id: "r6",
    title: "Cara menghafal rumus dengan cepat",
    subtitle: "Diskusi · Forum SMP · 4 balasan",
    type: "diskusi",
    href: "/forum/cara-menghafal-rumus",
  },
  {
    id: "r7",
    title: "Sistem Pencernaan Manusia",
    subtitle: "Materi · IPA · Kelas 8",
    type: "materi",
    href: "/materi/sistem-pencernaan",
  },
  {
    id: "r8",
    title: "Teks Deskripsi",
    subtitle: "Materi · Bahasa Indonesia · Kelas 8",
    type: "materi",
    href: "/materi/teks-deskripsi",
  },
];

/** Pencarian tiruan sederhana atas judul & subjudul. */
export function searchMock(query: string, limit = 6): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return searchIndex
    .filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.subtitle.toLowerCase().includes(q),
    )
    .slice(0, limit);
}
