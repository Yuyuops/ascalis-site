import { getSupabaseBrowserClient } from './supabase-browser'

export interface CockpitSummary {
  workspaceId: string | null
  actionsOverdue: number
  actionsDueToday: number
  actionsOpen: number
  kpisRed: number
  kpisOrange: number
  kpisTotal: number
  reviewsDue: number
  maturityScore: number   // 0–100
}

export interface ActionAlert {
  id: string
  title: string
  due_date: string
  priority: string
  status: string
  process_name?: string
}

export interface KpiAlert {
  id: string
  name: string
  kpi_group?: string
  current_value?: number
  target_value?: number
  unit?: string
  status: string
  trend: string
}

const empty = (): CockpitSummary => ({
  workspaceId: null,
  actionsOverdue: 0,
  actionsDueToday: 0,
  actionsOpen: 0,
  kpisRed: 0,
  kpisOrange: 0,
  kpisTotal: 0,
  reviewsDue: 0,
  maturityScore: 0,
})

async function getWorkspaceId(): Promise<string | null> {
  const supabase = getSupabaseBrowserClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()
  return data?.workspace_id ?? null
}

export async function getCockpitSummary(): Promise<CockpitSummary> {
  const wsId = await getWorkspaceId()
  if (!wsId) return empty()

  const supabase = getSupabaseBrowserClient()
  const today = new Date().toISOString().split('T')[0]
  const in30 = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]

  const [overdueRes, todayRes, openRes, redRes, orangeRes, totalKpiRes, reviewRes] =
    await Promise.all([
      supabase.from('actions').select('id', { count: 'exact', head: true })
        .eq('workspace_id', wsId).lt('due_date', today).not('status', 'in', '(done,cancelled)'),
      supabase.from('actions').select('id', { count: 'exact', head: true })
        .eq('workspace_id', wsId).eq('due_date', today).not('status', 'in', '(done,cancelled)'),
      supabase.from('actions').select('id', { count: 'exact', head: true })
        .eq('workspace_id', wsId).not('status', 'in', '(done,cancelled)'),
      supabase.from('kpis').select('id', { count: 'exact', head: true })
        .eq('workspace_id', wsId).eq('status', 'red'),
      supabase.from('kpis').select('id', { count: 'exact', head: true })
        .eq('workspace_id', wsId).eq('status', 'orange'),
      supabase.from('kpis').select('id', { count: 'exact', head: true })
        .eq('workspace_id', wsId),
      supabase.from('process_reviews').select('id', { count: 'exact', head: true })
        .eq('workspace_id', wsId).lte('review_date', in30).neq('status', 'done'),
    ])

  const overdue = overdueRes.count ?? 0
  const open    = openRes.count ?? 0
  const red     = redRes.count ?? 0
  const total   = totalKpiRes.count ?? 0

  // Score de maturité : pénalités sur actions en retard et KPI rouges
  const actionScore = open > 0 ? Math.max(0, 100 - (overdue / open) * 60) : 100
  const kpiScore    = total > 0 ? Math.max(0, 100 - (red / total) * 80) : 100
  const maturityScore = Math.round((actionScore * 0.5 + kpiScore * 0.5))

  return {
    workspaceId: wsId,
    actionsOverdue: overdue,
    actionsDueToday: todayRes.count ?? 0,
    actionsOpen: open,
    kpisRed: red,
    kpisOrange: orangeRes.count ?? 0,
    kpisTotal: total,
    reviewsDue: reviewRes.count ?? 0,
    maturityScore,
  }
}

export async function getOverdueActions(wsId: string): Promise<ActionAlert[]> {
  const supabase = getSupabaseBrowserClient()
  const today = new Date().toISOString().split('T')[0]
  const { data } = await supabase
    .from('actions')
    .select('id, title, due_date, priority, status, processes(name)')
    .eq('workspace_id', wsId)
    .lt('due_date', today)
    .not('status', 'in', '(done,cancelled)')
    .order('due_date', { ascending: true })
    .limit(5)
  return (data ?? []).map((a: Record<string, unknown>) => ({
    id: a.id as string,
    title: a.title as string,
    due_date: a.due_date as string,
    priority: a.priority as string,
    status: a.status as string,
    process_name: (a.processes as { name: string } | null)?.name,
  }))
}

export async function getRedKpis(wsId: string): Promise<KpiAlert[]> {
  const supabase = getSupabaseBrowserClient()
  const { data } = await supabase
    .from('kpis')
    .select('id, name, kpi_group, current_value, target_value, unit, status, trend')
    .eq('workspace_id', wsId)
    .in('status', ['red', 'orange'])
    .order('status', { ascending: true })
    .limit(5)
  return (data ?? []) as KpiAlert[]
}
