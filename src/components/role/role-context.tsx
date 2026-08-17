"use client";

import { createContext, useContext, useState } from "react";

import type { Role, RoleProfile } from "@/lib/mock/roles";
import { roleProfiles } from "@/lib/mock/roles";

interface RoleContextValue {
  role: Role;
  profile: RoleProfile;
  setRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

/**
 * Menyimpan peran aktif untuk tampilan. Sementara memakai data tiruan +
 * pengalih peran (preview) sampai autentikasi Supabase tersedia; setelah itu
 * peran diambil dari sesi pengguna.
 */
export function RoleProvider({
  initialRole = "siswa",
  children,
}: {
  initialRole?: Role;
  children: React.ReactNode;
}) {
  const [role, setRole] = useState<Role>(initialRole);

  return (
    <RoleContext.Provider value={{ role, profile: roleProfiles[role], setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    throw new Error("useRole harus dipakai di dalam <RoleProvider>");
  }
  return ctx;
}
