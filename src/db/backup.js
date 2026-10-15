import { db } from './db.js'

export async function exportDatabase() {
  const tables = {}
  for (const table of db.tables) tables[table.name] = await table.toArray()
  return { format: 'cbt-sma-backup', version: 1, exportedAt: new Date().toISOString(), tables }
}

export async function restoreDatabase(payload) {
  if (payload?.format !== 'cbt-sma-backup' || !payload.tables) throw new Error('Format backup tidak dikenali.')
  await db.transaction('rw', ...db.tables, async () => {
    for (const table of db.tables) {
      const rows = payload.tables[table.name]
      if (!Array.isArray(rows)) continue
      await table.clear()
      if (rows.length) await table.bulkAdd(rows)
    }
  })
}

export function downloadJson(data, filename) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
