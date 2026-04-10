import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const VALID_STATUS   = ['open', 'in_progress', 'done', 'cancelled'] as const
const VALID_PRIORITY = ['critical', 'high', 'medium', 'low'] as const

function parseDate(raw: string | undefined): string | null {
  if (!raw) return null
  const s = String(raw).trim()
  // DD/MM/YYYY
  const fr = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (fr) return `${fr[3]}-${fr[2].padStart(2,'0')}-${fr[1].padStart(2,'0')}`
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  // Excel serial number
  if (/^\d+$/.test(s)) {
    const d = XLSX.SSF.parse_date_code(Number(s))
    if (d) return `${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`
  }
  return null
}

function cell(row: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const v = row[k] ?? row[k.toLowerCase()] ?? row[k.toUpperCase()]
    if (v !== undefined && v !== null && String(v).trim() !== '') return String(v).trim()
  }
  return ''
}

// ─── POST /api/import/actions ─────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // Auth
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  // Workspace
  const { data: member } = await supabase
    .from('workspace_members').select('workspace_id').eq('user_id', user.id).limit(1).single()
  if (!member) return NextResponse.json({ error: 'Workspace introuvable' }, { status: 403 })
  const wsId = member.workspace_id

  // File
  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  let rows: Record<string, unknown>[]
  try {
    const wb = XLSX.read(buffer, { type: 'buffer', cellDates: false })
    const ws = wb.Sheets[wb.SheetNames[0]]
    rows = XLSX.utils.sheet_to_json(ws, { raw: false, defval: '' })
  } catch {
    return NextResponse.json({ error: 'Fichier illisible (CSV ou XLSX attendu)' }, { status: 400 })
  }

  if (rows.length === 0) return NextResponse.json({ error: 'Fichier vide' }, { status: 400 })
  if (rows.length > 500) return NextResponse.json({ error: 'Maximum 500 lignes par import' }, { status: 400 })

  // Charger les codes processus du workspace
  const { data: procs } = await supabase
    .from('processes').select('id, code').eq('workspace_id', wsId)
  const procMap = new Map((procs ?? []).map(p => [p.code.toUpperCase(), p.id]))

  // Valider + mapper
  const toInsert: Record<string, unknown>[] = []
  const errors:   { row: number; message: string }[] = []
  const warnings: { row: number; message: string }[] = []

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]
    const rowNum = i + 2  // +1 header, +1 1-indexed

    const titre = cell(r, 'titre', 'title', 'Titre', 'ACTION')
    if (!titre) { errors.push({ row: rowNum, message: 'Colonne "titre" manquante ou vide' }); continue }

    const statut   = cell(r, 'statut', 'status', 'Statut') || 'open'
    const priorite = cell(r, 'priorite', 'priority', 'Priorité', 'Priorite') || 'medium'
    const avancement = Math.min(100, Math.max(0, parseInt(cell(r, 'avancement', 'progress', 'Avancement') || '0', 10) || 0))

    if (!VALID_STATUS.includes(statut as typeof VALID_STATUS[number])) {
      warnings.push({ row: rowNum, message: `Statut "${statut}" inconnu → remplacé par "open"` })
    }
    if (!VALID_PRIORITY.includes(priorite as typeof VALID_PRIORITY[number])) {
      warnings.push({ row: rowNum, message: `Priorité "${priorite}" inconnue → remplacée par "medium"` })
    }

    const echeanceRaw = cell(r, 'echeance', 'due_date', 'Échéance', 'Echeance', 'date')
    const echeance = parseDate(echeanceRaw)
    if (echeanceRaw && !echeance) {
      warnings.push({ row: rowNum, message: `Date "${echeanceRaw}" non reconnue (utilisez JJ/MM/AAAA ou AAAA-MM-JJ)` })
    }

    const procCode = cell(r, 'processus_code', 'process_code', 'Processus', 'Code processus').toUpperCase()
    const processId = procCode ? procMap.get(procCode) ?? null : null
    if (procCode && !processId) {
      warnings.push({ row: rowNum, message: `Code processus "${procCode}" non trouvé → laissé vide` })
    }

    toInsert.push({
      workspace_id:    wsId,
      title:           titre,
      source:          cell(r, 'source', 'Source') || null,
      process_id:      processId,
      expected_effect: cell(r, 'effet_attendu', 'expected_effect', 'Effet attendu') || null,
      due_date:        echeance,
      status:          VALID_STATUS.includes(statut as typeof VALID_STATUS[number]) ? statut : 'open',
      priority:        VALID_PRIORITY.includes(priorite as typeof VALID_PRIORITY[number]) ? priorite : 'medium',
      progress:        avancement,
      notes:           cell(r, 'notes', 'Notes') || null,
      created_by:      user.id,
    })
  }

  if (toInsert.length === 0) {
    return NextResponse.json({ error: 'Aucune ligne valide à importer', errors }, { status: 400 })
  }

  // Insérer via admin client (contourne RLS pour le bulk insert)
  const admin = createAdminClient()
  const { error: insertErr } = await admin.from('actions').insert(toInsert)
  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })

  return NextResponse.json({
    imported: toInsert.length,
    skipped:  errors.length,
    warnings,
    errors,
  })
}
