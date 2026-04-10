import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function GET() {
  const headers = [
    'titre*',
    'source',
    'processus_code',
    'effet_attendu',
    'echeance',
    'statut',
    'priorite',
    'avancement',
    'notes',
  ]

  const examples = [
    ['Réviser la procédure de contrôle réception', 'Audit interne', 'PROC-001', 'Réduire les NC à réception de 30%', '30/06/2026', 'open',        'high',     '0',  ''],
    ['Formation ISO 9001 équipe qualité',           'Plan formation','',         'Monter en compétence SMQ',          '15/07/2026', 'open',        'medium',   '0',  ''],
    ['Mise à jour FMEA ligne B',                    'Retour terrain','PROC-002', 'Prévention défauts série',          '20/05/2026', 'in_progress', 'high',     '40', 'En attente validation client'],
  ]

  const info = [
    [],
    ['COLONNES'],
    ['titre*',          'Obligatoire'],
    ['source',          'Libre (ex: Audit, NC client, Revue...)'],
    ['processus_code',  'Code processus (ex: PROC-001) — doit exister dans ASCALIS'],
    ['effet_attendu',   'Libre'],
    ['echeance',        'Format JJ/MM/AAAA ou AAAA-MM-JJ'],
    ['statut',          'open | in_progress | done | cancelled'],
    ['priorite',        'critical | high | medium | low'],
    ['avancement',      'Nombre entier 0 à 100'],
    ['notes',           'Libre'],
  ]

  const ws = XLSX.utils.aoa_to_sheet([headers, ...examples, ...info])

  // Largeurs colonnes
  ws['!cols'] = [
    { wch: 50 }, { wch: 20 }, { wch: 16 }, { wch: 40 },
    { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 30 },
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Actions')
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="ASCALIS_template_import_actions.xlsx"',
    },
  })
}
