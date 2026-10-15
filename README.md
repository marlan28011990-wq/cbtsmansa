# CBT SMA

Aplikasi ujian sekolah offline-first untuk satu perangkat atau laboratorium komputer. Aplikasi memakai React 18, Vite, Tailwind CSS, React Router, Dexie/IndexedDB, SheetJS, dan Web Crypto SHA-256. Setiap browser menyimpan database lokal sendiri.

## Instalasi dan menjalankan

1. Pasang Node.js LTS.
2. Di folder proyek jalankan `npm install`.
3. Jalankan `npm run dev`, lalu buka alamat yang dicetak Vite.
4. Untuk membuat aplikasi produksi jalankan `npm run build`; pratinjau hasil dengan `npm run preview`.

Data contoh otomatis dibuat saat browser membuka aplikasi untuk pertama kali. Admin awal `admin` / `admin123`; guru contoh `guru.maya` dan `guru.budi` / `guru123`. Peserta masuk menggunakan NIS murid; pada data contoh, kata sandi awal setiap siswa sama dengan NIS masing-masing. Admin dapat mengatur ulang kata sandi siswa ke NIS dari Data Master. Ubah kredensial awal sebelum pemakaian nyata.

## Alur perangkat lab

1. Pada komputer admin, kelola jadwal dan ekspor Paket Ujian `.json` dari **Manajemen Ujian**.
2. Pindahkan paket ke komputer peserta melalui media lokal, impor di **Manajemen Ujian** pada perangkat itu, dan berikan token yang terlihat pada komputer admin.
3. Peserta membuka **Halaman peserta**, masuk dengan NIS dan kata sandi, pilih jadwal, masukkan token, lalu mengerjakan ujian.
4. Setelah mengumpulkan, peserta mengunduh File Hasil `.json`. Impor file tersebut di **Manajemen Ujian** komputer admin.
5. Rekap dapat diekspor ke Excel dari **Hasil & analisis**. Backup penuh dan pemulihan tersedia di **Pengaturan**.

## Fitur yang tersedia

- Login admin/guru dan login peserta, hash kata sandi SHA-256, dashboard, serta CRUD dasar peserta.
- Import/export data siswa dan soal Excel; kolom soal dapat menyimpan `konten` sebagai JSON, termasuk daftar opsi, kunci, pasangan, pernyataan, dan isian. Gambar dapat disimpan sebagai data URL/base64 pada kolom `gambar`.
- Jadwal ujian, token acak, paket lintas perangkat, enam tipe soal, timer berbasis waktu mulai tersimpan, navigasi jawaban, autosave, penanda ragu, deteksi pindah tab/fullscreen, dan ekspor hasil peserta.
- Koreksi nilai uraian dan hitung nilai, rekap Excel, ringkasan analisis butir, daftar hadir/kartu cetak, identitas sekolah, backup/restore seluruh tabel.

## Katalog mata pelajaran SMA

Saat pertama dijalankan setelah pembaruan, aplikasi menambahkan katalog mapel wajib, pilihan, seni/prakarya, enam pendidikan agama, bahasa asing, muatan lokal, serta Koding dan Kecerdasan Artifisial. Setiap mapel diberi kelompok dan tingkat kelas yang sesuai. Mapel yang telah ada dan penugasan gurunya tetap dipertahankan.

Katalog mengikuti struktur SMA Kurikulum Merdeka dalam [Permendikdasmen Nomor 13 Tahun 2025](https://www.kemendikdasmen.go.id/download/file/1244). Mapel pilihan tidak otomatis tersedia di semua sekolah; admin dapat menyesuaikannya dengan KSP, tenaga pendidik, dan sumber daya sekolah, serta menambah mapel lokal sendiri.

## Template Excel

Untuk siswa gunakan kolom `NIS`, `Nama`, `Rombel`, `NomorPeserta`, dan `Password`; kolom `NISN` opsional untuk data identitas tambahan. Untuk soal gunakan `mapelId`, `tingkat`, `jenis`, `kesulitan`, `bobot`, `pertanyaan`, `konten`, `pembahasan`, `gambar`. `konten` menerima objek JSON (misalnya `{"options":["A","B","C","D"],"correct":[0]}`) atau objek langsung bila file dibuat oleh SheetJS. Tipe soal: `pilihan_ganda`, `pilihan_ganda_kompleks`, `benar_salah`, `menjodohkan`, `isian_singkat`, `uraian`.

## Catatan operasional

Perangkat peserta harus telah mengimpor paket sebelum ujian. Hasil lokal tidak tersinkron otomatis; ekspor dan impor file diperlukan untuk memindahkan data. Gunakan browser modern dengan IndexedDB dan Web Crypto aktif. Skema Dexie awal ada di `src/db/db.js`; seed data di `src/db/seed.js`.
