export interface NavItem {
  label: string;
  href: string;
  icon:
    | "home"
    | "sparkles"
    | "help-circle"
    | "library"
    | "messages-square"
    | "clipboard-list"
    | "graduation-cap";
  /** Ditampilkan di bottom navigation mobile (dibatasi agar tidak penuh). */
  primary?: boolean;
}

export const navItems: NavItem[] = [
  { label: "Beranda", href: "/", icon: "home", primary: true },
  { label: "Latihan Soal", href: "/latihan/baru", icon: "sparkles", primary: true },
  { label: "Bantuan PR", href: "/bantuan-pr", icon: "help-circle", primary: true },
  { label: "Perpustakaan", href: "/perpustakaan", icon: "library", primary: true },
  { label: "Forum", href: "/forum", icon: "messages-square", primary: true },
  { label: "Tugas", href: "/tugas", icon: "clipboard-list" },
  { label: "Tutor AI", href: "/tutor", icon: "graduation-cap" },
];
