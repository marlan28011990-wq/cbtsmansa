import { db } from './db.js'
import { defaultClassNames } from '../utils/classes.js'

const legacyClasses = [
  ['X-IPA-1', 'X1', 'X'],
  ['XI-IPA-1', 'XI1', 'XI'],
  ['XII-IPA-1', 'XII1', 'XII'],
]

export async function ensureDefaultClasses() {
  if (await db.pengaturan.where('kunci').equals('classesCatalogV1').first()) return
  await db.transaction('rw', db.kelas, db.siswa, db.soal, db.ujian, db.pengaturan, async () => {
    for (const [oldCode, rombel, tingkat] of legacyClasses) {
      const oldClass = await db.kelas.where('kode').equals(oldCode).first()
      if (!oldClass) continue
      const target = await db.kelas.where('kode').equals(rombel).first()
      if (target && target.id !== oldClass.id) {
        await db.siswa.where('kelasId').equals(oldClass.id).modify({ kelasId: target.id, rombel })
        await db.soal.where('kelasId').equals(oldClass.id).modify({ kelasId: target.id, tingkat })
        await db.ujian.where('kelasId').equals(oldClass.id).modify({ kelasId: target.id })
        await db.kelas.delete(oldClass.id)
      } else {
        await db.kelas.update(oldClass.id, { kode: rombel, tingkat, nama: rombel, rombel })
        await db.siswa.where('kelasId').equals(oldClass.id).modify({ rombel })
      }
    }
    for (const rombel of defaultClassNames) {
      if (await db.kelas.where('kode').equals(rombel).first()) continue
      const tingkat = rombel.startsWith('XII') ? 'XII' : rombel.startsWith('XI') ? 'XI' : 'X'
      await db.kelas.add({ kode: rombel, tingkat, nama: rombel, rombel })
    }
    await db.pengaturan.add({ kunci: 'classesCatalogV1', nilai: defaultClassNames })
  })
}
