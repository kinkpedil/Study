import {
  Home,
  Sparkles,
  HelpCircle,
  Library,
  MessagesSquare,
  ClipboardList,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";

/**
 * Peta nama ikon → komponen lucide, supaya konfigurasi data (mock/nav) bisa
 * menyimpan nama ikon sebagai string dan tetap tree-shakeable.
 */
const iconMap: Record<string, LucideIcon> = {
  home: Home,
  sparkles: Sparkles,
  "help-circle": HelpCircle,
  library: Library,
  "messages-square": MessagesSquare,
  "clipboard-list": ClipboardList,
  "graduation-cap": GraduationCap,
};

export function getIcon(name: string): LucideIcon {
  return iconMap[name] ?? Home;
}
