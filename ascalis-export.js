/**
 * ascalis-export.js — Module d'export partagé ASCALIS
 *
 * Usage :
 *   import { exportXLSX, exportCSV } from './ascalis-export.js';
 *
 *   // Exporter un tableau HTML en XLSX
 *   exportXLSX(document.getElementById('mon-tableau'), 'ASCALIS_Pareto_Usine_2026-04');
 *
 *   // Exporter des données JSON en XLSX
 *   exportXLSX({ headers: ['Col A','Col B'], rows: [[1,2],[3,4]] }, 'ASCALIS_Export');
 *
 *   // CSV (aucune dépendance)
 *   exportCSV({ headers: ['Col A','Col B'], rows: [[1,2],[3,4]] }, 'ASCALIS_Export');
 */

const SHEETJS_CDN = 'https://cdn.sheetjs.com/xlsx-0.18.5/package/dist/xlsx.full.min.js';

let _xlsxPromise = null;

/** Charge SheetJS une seule fois (lazy, cached) */
function loadXLSX() {
  if (_xlsxPromise) return _xlsxPromise;
  _xlsxPromise = new Promise((resolve, reject) => {
    if (window.XLSX) { resolve(window.XLSX); return; }
    const script = document.createElement('script');
    script.src = SHEETJS_CDN;
    script.onload  = () => resolve(window.XLSX);
    script.onerror = () => reject(new Error('Impossible de charger SheetJS'));
    document.head.appendChild(script);
  });
  return _xlsxPromise;
}

/**
 * Export XLSX.
 * @param {HTMLTableElement|{headers: string[], rows: (string|number)[][]}} source
 * @param {string} filename  — sans extension
 */
export async function exportXLSX(source, filename) {
  const XLSX = await loadXLSX();
  let wb;

  if (source instanceof HTMLTableElement) {
    wb = XLSX.utils.table_to_book(source, { sheet: 'ASCALIS', raw: false });
  } else {
    const ws = XLSX.utils.aoa_to_sheet([source.headers, ...source.rows]);
    wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ASCALIS');
  }

  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/**
 * Export CSV (sans dépendance externe).
 * Compatible avec l'existant ASCALIS (BOM UTF-8, séparateur ;).
 * @param {{headers: string[], rows: (string|number)[][]}} data
 * @param {string} filename  — sans extension
 */
export function exportCSV(data, filename) {
  const escape = (v) => {
    const s = String(v ?? '');
    return s.includes(';') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const lines = [data.headers, ...data.rows]
    .map((row) => row.map(escape).join(';'))
    .join('\r\n');
  const blob = new Blob(['\uFEFF' + lines], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Génère un nom de fichier ASCALIS normalisé.
 * @param {string} tool     — ex. 'Pareto'
 * @param {string} context  — ex. 'Usine-Nord'
 * @returns {string}        — ex. 'ASCALIS_Pareto_Usine-Nord_2026-04-07'
 */
export function ascalisFilename(tool, context) {
  const today = new Date().toISOString().slice(0, 10);
  const safe  = (s) => s.replace(/[^a-zA-Z0-9À-ÿ\-]/g, '-').replace(/-+/g, '-');
  return `ASCALIS_${safe(tool)}_${safe(context)}_${today}`;
}
