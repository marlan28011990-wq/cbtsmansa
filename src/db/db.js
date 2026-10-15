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

export default db
