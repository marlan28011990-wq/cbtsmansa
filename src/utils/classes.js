export const defaultClassNames = [
  'X1', 'X2', 'X3', 'X4', 'X5',
  'XI1', 'XI2', 'XI3', 'XI4', 'XI5',
  'XII1', 'XII2', 'XII3', 'XII4', 'XII5',
]

export function sortClassRecords(classes = []) {
  const tier = { X: 0, XI: 1, XII: 2 }
  const getTier = (item) => tier[item.tingkat] ?? 3
  return [...classes].sort((a, b) => {
    const grade = getTier(a) - getTier(b)
    if (grade) return grade
    return String(a.rombel || a.nama || '').localeCompare(String(b.rombel || b.nama || ''), 'id', { numeric: true })
  })
}
