GANTI KODE JAVASCRIPT YANG SAYA KIRIM SEBELUMNYA DENGAN VERSI YANG SUDAH DIPERBAIKI.

TUJUAN PERBAIKAN:
Foto calon Ketua dan Wakil Ketua OSIS harus tampil.

JANGAN MENGUBAH:
- API_URL
- Google Apps Script
- Spreadsheet
- database
- sistem login admin
- sistem voting
- sistem rekap
- sistem PIN
- nama file gambar
- folder images
- fungsi-fungsi lain yang sudah berjalan

MASALAH:
Aplikasi dibuka dari Google Apps Script Web App, tetapi foto berada di GitHub Pages.

Repository:
https://github.com/chiara219/pemilihan-osis

Folder:
images/

File yang sudah ada:
calon1-ketua.jpeg
calon1-wakil.jpeg
calon2-ketua.jpeg
calon2-wakil.jpeg
calon3-ketua.jpeg
calon3-wakil.jpeg
calon4-ketua.jpeg
calon4-wakil.jpeg

GUNAKAN URL FOTO BERIKUT:

https://chiara219.github.io/pemilihan-osis/images/

Jadi URL lengkapnya harus:

https://chiara219.github.io/pemilihan-osis/images/calon1-ketua.jpeg
https://chiara219.github.io/pemilihan-osis/images/calon1-wakil.jpeg
https://chiara219.github.io/pemilihan-osis/images/calon2-ketua.jpeg
https://chiara219.github.io/pemilihan-osis/images/calon2-wakil.jpeg
https://chiara219.github.io/pemilihan-osis/images/calon3-ketua.jpeg
https://chiara219.github.io/pemilihan-osis/images/calon3-wakil.jpeg
https://chiara219.github.io/pemilihan-osis/images/calon4-ketua.jpeg
https://chiara219.github.io/pemilihan-osis/images/calon4-wakil.jpeg

PERBAIKI BAGIAN KODE YANG SEKARANG:

const fotoKetua = `images/calon${no}-ketua.jpeg`;
const fotoWakil = `images/calon${no}-wakil.jpeg`;

MENJADI:

const fotoKetua =
  `https://chiara219.github.io/pemilihan-osis/images/calon${no}-ketua.jpeg`;

const fotoWakil =
  `https://chiara219.github.io/pemilihan-osis/images/calon${no}-wakil.jpeg`;

JUGA PERBAIKI BAGIAN FOTO WINNER DAN FOTO ADMIN AGAR MENGGUNAKAN URL GITHUB PAGES JIKA URL FOTO DARI SERVER KOSONG.

BUAT HELPER:

function getCandidatePhoto(no, type) {
  return `https://chiara219.github.io/pemilihan-osis/images/calon${no}-${type}.jpeg`;
}

Untuk foto Ketua gunakan:

getCandidatePhoto(c.no, "ketua")

Untuk foto Wakil gunakan:

getCandidatePhoto(c.no, "wakil")

Untuk winner gunakan:

getCandidatePhoto(w.no, "ketua")
getCandidatePhoto(w.no, "wakil")

PENTING:

JANGAN membuat saya mengganti foto satu per satu.

JANGAN meminta URL foto satu per satu.

JANGAN mengganti nama file.

JANGAN mengganti folder images.

JANGAN mengubah desain.

JANGAN mengubah sistem voting.

JANGAN mengubah fungsi API.

JANGAN menghapus fitur apa pun.

SETELAH DIPERBAIKI, BERIKAN KODE JAVASCRIPT LENGKAP DARI AWAL SAMPAI AKHIR YANG SIAP SAYA COPY-PASTE UNTUK MENGGANTIKAN KODE JAVASCRIPT LAMA.

JANGAN BERIKAN PENJELASAN PANJANG.
LANGSUNG BERIKAN KODE FINAL LENGKAP.
