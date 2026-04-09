export const STORAGE_KEY = "ascalis_pro_session";

export type UserRole = "admin" | "client";

export interface ProUser {
  email: string;
  name: string;
  role: UserRole;
  initials: string;
}

const ACCOUNTS = [
  { email: "admin@ascalis.fr", password: "ascalis2026", name: "Admin ASCALIS", role: "admin" as UserRole, initials: "AA" },
  { email: "client@demo.fr", password: "demo2026", name: "Client Demo", role: "client" as UserRole, initials: "CD" },
];

export function login(email: string, password: string): ProUser | null {
  const account = ACCOUNTS.find(
    (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password,
  );
  if (!account) return null;
  const user: ProUser = { email: account.email, name: account.name, role: account.role, initials: account.initials };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}

export function logout(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getCurrentUser(): ProUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ProUser;
  } catch {
    return null;
  }
}
