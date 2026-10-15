import { db } from './db.js'

const hashPassword = async (password) => {
  const bytes = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

const questionTypes = ['pilihan_ganda', 'pilihan_ganda_kompleks', 'benar_salah', 'menjodohkan', 'isian_singkat', 'uraian']
const sampleQuestions = Array.from({ length: 30 }, (_, index) => {
  const number = index + 1
  const type = questionTypes[index % questionTypes.length]
  const subjectId = number % 2 === 0 ? 2 : 1
  const prompt = subjectId === 1
    ? `Pilih jawaban yang tepat untuk soal Matematika nomor ${number}.`
    : `Perhatikan konsep Bahasa Indonesia berikut, lalu jawab nomor ${number}.`
  const answer = {
    pilihan_ganda: { options: ['Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D'], correct: [number % 4] },
    pilihan_ganda_kompleks: { options: ['Pernyataan A', 'Pernyataan B', 'Pernyataan C', 'Pernyataan D'], correct: [0, 2] },
    benar_salah: { statements: [{ text: 'Pernyataan contoh benar', correct: true }, { text: 'Pernyataan contoh salah', correct: false }] },
    menjodohkan: { pairs: [{ left: 'Pasangan A', right: 'Jawaban A' }, { left: 'Pasangan B', right: 'Jawaban B' }] },
    isian_singkat: { accepted: [`jawaban ${number}`, `jawaban${number}`] },
    uraian: { rubric: 'Dinilai oleh guru berdasarkan ketepatan dan kelengkapan jawaban.' },
  }[type]
  return {
    mapelId: subjectId, tingkat: ['X', 'XI', 'XII'][number % 3], kelasId: ((number - 1) % 3) + 1,
    jenis: type, kesulitan: ['mudah', 'sedang', 'sulit'][number % 3], bobot: 1,
    pertanyaan: prompt, konten: answer, pembahasan: '', gambar: null, createdAt: new Date().toISOString(),
  }
})

export async function seedDatabase() {
  if (await db.users.count()) return false

  const passwordHash = await hashPassword('admin123')
  await db.transaction('rw', db.users, db.siswa, db.guru, db.kelas, db.mapel, db.tahunAjaran, db.soal, db.ujian, db.ujianSoal, db.pesertaUjian, db.pengaturan, async () => {
    await db.users.bulkAdd([
      { username: 'admin', passwordHash, role: 'admin', nama: 'Administrator' },
      { username: 'guru.maya', passwordHash: await hashPassword('guru123'), role: 'guru', guruId: 1, nama: 'Maya Lestari' },
      { username: 'guru.budi', passwordHash: await hashPassword('guru123'), role: 'guru', guruId: 2, nama: 'Budi Santoso' },
    ])
    await db.guru.bulkAdd([
      { nip: '198605102010012001', nama: 'Maya Lestari', email: 'maya@sekolah.sch.id' },
      { nip: '198203152008011003', nama: 'Budi Santoso', email: 'budi@sekolah.sch.id' },
    ])
    await db.kelas.bulkAdd([
      { kode: 'X-IPA-1', tingkat: 'X', nama: 'X IPA 1', rombel: 'X IPA 1' },
      { kode: 'XI-IPA-1', tingkat: 'XI', nama: 'XI IPA 1', rombel: 'XI IPA 1' },
      { kode: 'XII-IPA-1', tingkat: 'XII', nama: 'XII IPA 1', rombel: 'XII IPA 1' },
    ])
    const students = Array.from({ length: 20 }, (_, index) => {
      const n = index + 1
      return { nisn: `00876543${String(n).padStart(2, '0')}`, nomorPeserta: `26${String(n).padStart(4, '0')}`, nama: `Siswa Contoh ${String(n).padStart(2, '0')}`, kelasId: ((index % 3) + 1), rombel: ['X IPA 1', 'XI IPA 1', 'XII IPA 1'][index % 3], status: 'aktif', passwordHash }
    })
    const studentIds = await db.siswa.bulkAdd(students, { allKeys: true })
    await db.mapel.bulkAdd([
      { kode: 'MAT', nama: 'Matematika', guruId: 1, tingkat: ['X', 'XI', 'XII'] },
      { kode: 'BIN', nama: 'Bahasa Indonesia', guruId: 2, tingkat: ['X', 'XI', 'XII'] },
    ])
    await db.tahunAjaran.add({ label: '2026/2027', semester: 'Ganjil', aktif: true })
    await db.soal.bulkAdd(sampleQuestions)
    const examId = await db.ujian.add({
      kode: 'SIM-2026-01', nama: 'Simulasi Ujian Matematika', jenis: 'Try Out', mapelId: 1, kelasId: 2,
      tanggal: new Date().toISOString().slice(0, 10), jamMulai: '08:00', durasiMenit: 90, jumlahSoal: 10,
      acakSoal: true, acakOpsi: true, tampilkanNilai: false, batasMinimalMenit: 15,
      token: 'CBT261', status: 'aktif', kompleksMode: 'proporsional',
    })
    const examQuestions = await db.soal.where('mapelId').equals(1).limit(10).toArray()
    await db.ujianSoal.bulkAdd(examQuestions.map((question, index) => ({ ujianId: examId, soalId: question.id, urutan: index + 1 })))
    const examStudents = students.map((student, index) => ({ student, id: studentIds[index] })).filter(({ student }) => student.kelasId === 2)
    await db.pesertaUjian.bulkAdd(examStudents.map(({ id }) => ({ ujianId: examId, siswaId: id, status: 'belum_login', pelanggaranCount: 0 })))
    await db.pengaturan.bulkAdd([
      { kunci: 'sekolah', nilai: { nama: 'SMA Contoh Nusantara', alamat: '', kepalaSekolah: '', logo: null } },
      { kunci: 'seedVersion', nilai: 1 },
    ])
  })
  return true
}
