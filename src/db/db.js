import Dexie from 'dexie'

export const db = new Dexie('cbtSma')

db.version(1).stores({
  users: '++id, &username, role, guruId, siswaId',
  siswa: '++id, &nisn, nomorPeserta, nama, kelasId, rombel, status',
  guru: '++id, &nip, nama, email',
  kelas: '++id, &kode, tingkat, nama, rombel',
  mapel: '++id, &kode, nama, guruId, tingkat',
  tahunAjaran: '++id, &label, aktif, semester',
  soal: '++id, mapelId, tingkat, kelasId, jenis, kesulitan, updatedAt',
  ujian: '++id, &kode, nama, mapelId, kelasId, tanggal, status, token',
  ujianSoal: '++id, ujianId, soalId, urutan, &[ujianId+soalId]',
  pesertaUjian: '++id, ujianId, siswaId, status, startedAt, &[ujianId+siswaId]',
  jawaban: '++id, pesertaUjianId, soalId, status, &[pesertaUjianId+soalId]',
  hasil: '++id, ujianId, siswaId, pesertaUjianId, status, nilai, &[ujianId+siswaId]',
  pelanggaran: '++id, pesertaUjianId, waktu, jenis',
  pengaturan: '++id, &kunci',
})

db.version(2).stores({
  siswa: '++id, &nis, &nisn, nomorPeserta, nama, kelasId, rombel, status',
}).upgrade((tx) => tx.table('siswa').toCollection().modify((student) => {
  if (!student.nis) student.nis = student.nisn || student.nomorPeserta || ''
}))

db.version(3).stores({}).upgrade(async (tx) => {
  const seededStems = ['Pilih jawaban yang tepat untuk soal Matematika nomor ', 'Perhatikan konsep Bahasa Indonesia berikut, lalu jawab nomor ']
  await tx.table('soal').toCollection().modify((question) => {
    const isSeeded = seededStems.some((stem) => question.pertanyaan?.startsWith(stem))
    if (!isSeeded) return
    const number = Number(question.pertanyaan.match(/nomor (\d+)/)?.[1])
    if (!number) return
    question.mapelId = number <= 15 ? 1 : 2
    question.kelasId = Math.floor(((number - 1) % 15) / 5) + 1
    question.tingkat = ({ 1: 'X', 2: 'XI', 3: 'XII' })[question.kelasId]
  })
  const exam = await tx.table('ujian').where('kode').equals('SIM-2026-01').first()
  if (!exam) return
  const participants = await tx.table('pesertaUjian').where('ujianId').equals(exam.id).toArray()
  if (participants.some((participant) => participant.startedAt)) return
  const classRecord = await tx.table('kelas').get(exam.kelasId)
  const pool = await tx.table('soal').where('mapelId').equals(exam.mapelId).filter((question) => question.kelasId === exam.kelasId && question.tingkat === classRecord?.tingkat).toArray()
  const links = tx.table('ujianSoal')
  await links.where('ujianId').equals(exam.id).delete()
  await links.bulkAdd(pool.slice(0, 5).map((question, index) => ({ ujianId: exam.id, soalId: question.id, urutan: index + 1 })))
  await tx.table('ujian').update(exam.id, { jumlahSoal: Math.min(pool.length, 5) })
})

export default db
