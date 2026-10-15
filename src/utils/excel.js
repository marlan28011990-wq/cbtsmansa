import * as XLSX from 'xlsx'

export function exportRows(rows, filename, sheetName = 'Data') {
  const sheet = XLSX.utils.json_to_sheet(rows)
  const book = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(book, sheet, sheetName)
  XLSX.writeFile(book, filename)
}

export async function readExcel(file) {
  const book = XLSX.read(await file.arrayBuffer(), { type: 'array' })
  return XLSX.utils.sheet_to_json(book.Sheets[book.SheetNames[0]], { defval: '' })
}
