import { getSupabaseBrowserClient } from './supabase-browser'

export type UserRole = "admin" | "client"

export interface ProUser {
  email: string
  name: string
  role: UserRole
  initials: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function userFromSupabase(supabaseUser: any): ProUser | null {
  if (!supabaseUser) return null
  const meta = supabaseUser.user_metadata ?? {}
  return {
    email: supabaseUser.email ?? '',
    name: meta.name ?? supabaseUser.email ?? '',
    role: (meta.role as UserRole) ?? 'client',
    initials: meta.initials ?? (supabaseUser.email?.[0]?.toUpperCase() ?? '?'),
  }
}

export async function login(email: string, password: string): Promise<ProUser | null> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.user) return null
  return userFromSupabase(data.user)
}

export async function logout(): Promise<void> {
  const supabase = getSupabaseBrowserClient()
  await supabase.auth.signOut()
}

export async function getCurrentUser(): Promise<ProUser | null> {
  const supabase = getSupabaseBrowserClient()
  const { data: { user } } = await supabase.auth.getUser()
  return userFromSupabase(user)
}
