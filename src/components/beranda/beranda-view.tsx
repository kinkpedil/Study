"use client";

import { useRole } from "@/components/role/role-context";
import { RoleSwitcher } from "@/components/role/role-switcher";
import { StudentDashboard } from "./student-dashboard";
import { GuruDashboard } from "./guru-dashboard";
import { AdminDashboard } from "./admin-dashboard";

/**
 * Menampilkan Beranda sesuai peran pengguna. Data masih tiruan, sehingga
 * disediakan pengalih peran untuk pratinjau tiap tampilan.
 */
export function BerandaView() {
  const { role } = useRole();

  return (
    <div className="space-y-6">
      <RoleSwitcher />
      {role === "siswa" && <StudentDashboard />}
      {role === "guru" && <GuruDashboard />}
      {role === "admin" && <AdminDashboard />}
    </div>
  );
}
