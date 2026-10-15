import { db } from './db.js'

// Katalog mata pelajaran SMA Kurikulum Merdeka yang diselaraskan dengan
// Permendikdasmen 13/2025. Mata pelajaran pilihan tidak otomatis ditawarkan
// oleh sekolah; sekolah menyesuaikannya dengan KSP dan sumber daya yang tersedia.
export const kurikulumSma2025 = [
  ...[
    ['PAI', 'Pendidikan Agama Islam dan Budi Pekerti'],
    ['PAKR', 'Pendidikan Agama Kristen dan Budi Pekerti'],
    ['PAKAT', 'Pendidikan Agama Katolik dan Budi Pekerti'],
    ['PAH', 'Pendidikan Agama Hindu dan Budi Pekerti'],
    ['PAB', 'Pendidikan Agama Buddha dan Budi Pekerti'],
    ['PAKH', 'Pendidikan Agama Khonghucu dan Budi Pekerti'],
  ].map(([kode, nama]) => ({ kode, nama, kelompok: 'Wajib', tingkat: ['X', 'XI', 'XII'] })),
  { kode: 'PANC', nama: 'Pendidikan Pancasila', kelompok: 'Wajib', tingkat: ['X', 'XI', 'XII'] },
  { kode: 'BIN', nama: 'Bahasa Indonesia', kelompok: 'Wajib', tingkat: ['X', 'XI', 'XII'] },
  { kode: 'MAT', nama: 'Matematika', kelompok: 'Wajib', tingkat: ['X', 'XI', 'XII'] },
  { kode: 'IPA', nama: 'Ilmu Pengetahuan Alam (IPA)', kelompok: 'Wajib kelas X', tingkat: ['X'], keterangan: 'Muatan Fisika, Kimia, dan Biologi terintegrasi.' },
  { kode: 'IPS', nama: 'Ilmu Pengetahuan Sosial (IPS)', kelompok: 'Wajib kelas X', tingkat: ['X'], keterangan: 'Muatan Sosiologi, Ekonomi, Sejarah, dan Geografi terintegrasi.' },
  { kode: 'BING', nama: 'Bahasa Inggris', kelompok: 'Wajib', tingkat: ['X', 'XI', 'XII'] },
  { kode: 'PJOK', nama: 'Pendidikan Jasmani, Olahraga, dan Kesehatan', kelompok: 'Wajib', tingkat: ['X', 'XI', 'XII'] },
  { kode: 'SEJ', nama: 'Sejarah', kelompok: 'Wajib kelas XI–XII', tingkat: ['XI', 'XII'] },
  { kode: 'INF', nama: 'Informatika', kelompok: 'Wajib kelas X / pilihan kelas XI–XII', tingkat: ['X', 'XI', 'XII'] },
  { kode: 'SBP', nama: 'Seni, Budaya, dan Prakarya', kelompok: 'Wajib kelas X', tingkat: ['X'] },
  ...[
    ['SENMUS', 'Seni Musik'], ['SENRUP', 'Seni Rupa'], ['SENTEAT', 'Seni Teater'], ['SENTARI', 'Seni Tari'],
  ].map(([kode, nama]) => ({ kode, nama, kelompok: 'Pilihan seni', tingkat: ['X', 'XI', 'XII'] })),
  ...[
    ['PRKBUD', 'Prakarya Budi Daya'], ['PRKKER', 'Prakarya Kerajinan'],
    ['PRKREK', 'Prakarya Rekayasa'], ['PRKOLA', 'Prakarya Pengolahan'],
  ].map(([kode, nama]) => ({ kode, nama, kelompok: 'Pilihan prakarya', tingkat: ['X'] })),
  ...[
    ['MATLAN', 'Matematika Tingkat Lanjut'], ['FIS', 'Fisika'], ['KIM', 'Kimia'], ['BIO', 'Biologi'],
    ['GEO', 'Geografi'], ['SEJLAN', 'Sejarah Tingkat Lanjut'], ['SOS', 'Sosiologi'], ['EKO', 'Ekonomi'],
    ['BINDLAN', 'Bahasa Indonesia Tingkat Lanjut'], ['BINGLAN', 'Bahasa Inggris Tingkat Lanjut'],
    ['BAR', 'Bahasa Arab'], ['BJEP', 'Bahasa Jepang'], ['BJER', 'Bahasa Jerman'],
    ['BKOR', 'Bahasa Korea'], ['BMAN', 'Bahasa Mandarin'], ['BPER', 'Bahasa Prancis'],
    ['ANT', 'Antropologi'], ['KKA', 'Koding dan Kecerdasan Artifisial'],
  ].map(([kode, nama]) => ({ kode, nama, kelompok: nama === 'Koding dan Kecerdasan Artifisial' ? 'Pilihan semua tingkat' : 'Pilihan kelas XI–XII', tingkat: nama === 'Koding dan Kecerdasan Artifisial' ? ['X', 'XI', 'XII'] : ['XI', 'XII'] })),
  { kode: 'PKWU', nama: 'Prakarya dan Kewirausahaan', kelompok: 'Pilihan kelas XI–XII', tingkat: ['XI', 'XII'], keterangan: 'Pilihan bidang budi daya, kerajinan, rekayasa, atau pengolahan.' },
  { kode: 'MULOK', nama: 'Muatan Lokal (sesuaikan dengan daerah/sekolah)', kelompok: 'Muatan lokal', tingkat: ['X', 'XI', 'XII'] },
]

export async function ensureCurriculumSubjects() {
  const marker = await db.pengaturan.where('kunci').equals('kurikulumSma2025').first()
  if (marker?.nilai === 1) return 0

  return db.transaction('rw', db.mapel, db.pengaturan, async () => {
    const currentMarker = await db.pengaturan.where('kunci').equals('kurikulumSma2025').first()
    if (currentMarker?.nilai === 1) return 0

    let added = 0
    for (const subject of kurikulumSma2025) {
      const existing = await db.mapel.where('kode').equals(subject.kode).first()
      if (existing) {
        await db.mapel.update(existing.id, {
          kelompok: subject.kelompok,
          tingkat: subject.tingkat,
          ...(subject.keterangan ? { keterangan: subject.keterangan } : {}),
        })
      } else {
        await db.mapel.add({ ...subject, kurikulum: 'Kurikulum Merdeka 2025' })
        added++
      }
    }

    if (currentMarker) await db.pengaturan.update(currentMarker.id, { nilai: 1 })
    else await db.pengaturan.add({ kunci: 'kurikulumSma2025', nilai: 1 })
    return added
  })
}
