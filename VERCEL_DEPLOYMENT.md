# Panduan Publikasi (Deployment) TataNota ke Vercel

Aplikasi TataNota ini menggunakan framework Next.js, yang mana dikembangkan dan sangat serasi jika di-_deploy_ menggunakan layanan _hosting_ Vercel.

Berikut adalah panduan langkah demi langkah untuk merilis TataNota ke _production environment_ melalui Vercel:

## 1. Persiapan Kode Lokal

Sebelum melakukan publikasi ke Vercel, pastikan kode sudah terunggah (di-_push_) ke GitHub, GitLab, atau Bitbucket milik Anda.

Jika belum, silakan buka terminal di folder proyek TataNota dan unggah (_push_) ke GitHub:

```bash
git init
git add .
git commit -m "Siap rilis TataNota ke production"
git branch -M main
git remote add origin https://github.com/username-github-kamu/tatanota.git
git push -u origin main
```

## 2. Memulai Publikasi di Platform Vercel

1. Buka browser dan pergi ke situs **[Vercel.com](https://vercel.com/)**.
2. Lakukan **Login / Daftar** menggunakan akun GitHub kamu.
3. Di halaman _Dashboard_ utama Vercel, temukan lalu klik tombol **"Add New..."** lalu pilih **"Project"**.
4. Di bagian **"Import Git Repository"**, vercel akan menampilkan senarai _repository_ github kamu. Cari repository `tatanota` yang baru saja kamu _push_, lalu klik **"Import"**.

## 3. Konfigurasi Project

Setelah klik Import, kamu bisa mengatur konfigurasi spesifik untuk _build_ proyek kamu. Karena kita membangun ini menggunakan _framework_ asli mereka, Vercel akan **otomatis** mengenali _setting_ (Next.js) tanpa perlu diedit sedikit pun.

🚨 **PENTING: Masukkan Environment Variables (Variabel Lingkungan)**
Klik menu dropdown **"Environment Variables"** (sebelum kamu klik Deploy) dan tempel / _copy-paste_ kunci rahasia yang ada di file `.env.local` komputermu ke Vercel.

Daftar _keys_ yang harus di-Copy Paste:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

_(Vercel mempermudah hal ini, kamu bisa langsung copy seluruh isi teks dari `.env.local` lalu paste langsung ke baris pertama environment variables Vercel agar terisi dan tertata otomatis!)_

## 4. Proses Deploy (Publikasi 🚀)

1. Setelah semua Environment Variables dipastikan masuk/muncul daftarnya di bawah, silahkan klik tombol **"Deploy"**.
2. Vercel akan menjalankan proses _Building_ (membuat versi Production) secara otomatis selama kurang lebih 1-2 menit.
3. Jika berhasil, kamu akan diarahkan ke halaman sukses dengan perayaan kembang api (🎉 _Congratulations!_).
4. Klik kotak _preview_ jendela aplikasi atau **"Continue to Dashboard"** untuk mendapatkan dan membuka _link URL_ asli situs aplikasi kamu (biasanya berbentuk `tatanota-...vercel.app`)!

---

## 5. Tambahan Penting Terakhir: Izinkan Login Google Firebase

Sekarang aplikasi TataNota dan sistem otentikasi kamu sudah berada di internet publik. Kamu perlu memberi tahu sistem Google Firebase bahwa URL domain publik ini (dari vercel) adalah URL resmi yang _"Diizinkan"_ untuk dipakai memanggil login Google klienmu.

*Jika tahap ini dilewati, maka layar *Login Google* di vercel kamu akan muncul pesan Error Blocked/Unauthorized.*

1. Pergi kunjungi **[Situs Firebase Console](https://console.firebase.google.com/)** > lalu pilih kembali proyek **tatanota**.
2. Pada panel kiri masuklah ke menu **Authentication**.
3. Di jendela Authentication, klik tab **"Settings"** (atau tombol gerigi pengaturan Auth).
4. Pilih baris menu bernama **"Authorized domains"**.
5. Klik **"Add domain"** dan tempel / _paste_ domain baru atau URL yang baru saja kamu dapatkan dari hasil _deploy_ Vercel (misal: `tatanota-alwizen.vercel.app` atau `tatanota.vercel.app`. **INGAT!** tulis domainnya saja, TANPA 'https://' ataupun garis miring '/' dibelakangnya).
6. Simpan pengaturan (_Save_).

Selamat, aplikasi _TataNota_ ciptaanmu telah _Live_ 100% dan sudah online beroperasi penuh di internet! 🎊
