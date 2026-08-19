Lomba e-Government
## PETROCHAIN: Platform Intelligent Verification dan
## Audit untuk Penguatan Distribusi BBM Bersubsidi pada
## Ekosistem MyPertamina
Nama Tim : TIMBERAPA
Nama Anggota :
Muhammad Aziz 2024573010089
Amirullah 2024573010018
Deswita Nazwa Ariani 2024573010003
## POLITEKNIK NEGERI LHOKSEUMAWE
## LHOKSEUMAWE
## 2026

---

ii
### DAFTAR ISI
DAFTAR ISI..............................................................................................................................ii
DAFTAR GAMBAR ............................................................................................................... iii
DAFTAR TABEL ..................................................................................................................... iv
DAFTAR LAMPIRAN .............................................................................................................. v
BAB I PENDAHULUAN .......................................................................................................... 1
1.1 Latar Belakang ................................................................................................................ 1
1.2 Tujuan .............................................................................................................................. 2
1.3 Manfaat ............................................................................................................................ 3
1.4 Target Pengguna .............................................................................................................. 3
BAB II GAGASAN ................................................................................................................... 5
2.1 Kondisi Aktual Objek Permasalahan .............................................................................. 5
2.1.1 Beban Subsidi Energi dan Tantangan Distribusi ....................................................... 5
2.1.2 Distribusi Subsidi BBM Masih Belum Optimal........................................................ 6
2.1.3 Dinamika Regulasi Distribusi BBM Bersubsidi ....................................................... 6
2.1.4 Tantangan Implementasi Digitalisasi MyPertamina ................................................. 7
2.2 Inovasi Teknologi yang Digunakan pada PETROCHAIN.............................................. 8
2.2.1 Penguatan Proses Registrasi Menggunakan OCR Assisted Registration ................ 10
2.2.2 Penguatan Validasi Kendaraan Menggunakan YOLO–OCR ................................. 10
2.2.3 Penguatan Transparansi Audit Menggunakan Blockchain ..................................... 11
2.2.4 Penguatan Validasi Kendaraan Roda Dua (Motor) Berdasarkan Kapasitas Mesin
Menggunakan YOLO......................................................................................................... 12
2.2.5 Penyediaan Informasi Ketersediaan BBM .............................................................. 13
2.3 Rancangan Mockup Implementasi Gagasan PETROCHAIN ....................................... 14
2.4 Mekanisme Operasional pada PETROCHAIN ............................................................. 22
2.5 Uraian Peran & Kontribusi Pihak yang Terlibat dalam PETROCHAIN ...................... 28
2.6 Keunggulan Inovasi pada PETROCHAIN .................................................................... 29
2.7 Tahapan-Tahapan Strategis Penerapan PETROCHAIN ............................................... 30
BAB III KESIMPULAN.......................................................................................................... 32
DAFTAR PUSTAKA .............................................................................................................. 33
LAMPIRAN ............................................................................................................................. 35

---

iii
### DAFTAR GAMBAR
Gambar 2.1 Perkembangan Beban Negara untuk Subsidi BBM Tahun 2021–2025 ................. 6
Gambar 2.2 Logika Sistem Terintegrasi PETROCHAIN .......................................................... 9
Gambar 2.3 Flow OCR Assisted Registration ......................................................................... 10
Gambar 2.4 Flow validasi kendaraan....................................................................................... 11
Gambar 2.5 Diagram alur Blockchain ..................................................................................... 12
Gambar 2.6 Alur Logika Sistem Yolo pada Kendaraan Roda Dua ......................................... 13
Gambar 2.7 Flow update stok dari Admin ............................................................................... 14
Gambar 2.8 Landing Page Website ......................................................................................... 15
Gambar 2.9 Landing Page Website Admin Pertamina ............................................................ 15
Gambar 2.10 Mockup Laporan Keuangan dan Pemasukan Global ......................................... 16
Gambar 2.11 Halaman Monitor Semua Transaksi Global dan Log Transaksi ........................ 16
Gambar 2.12 Panel Transaksi & Audit Transparansi .............................................................. 17
Gambar 2.13 Halaman Monitor Daftar Operator SPBU Aktif ................................................ 17
Gambar 2.14 Halaman Manajemen Data Wilayah SPBU dan Operator ................................. 18
Gambar 2.15 Mockup website Admin Pertamina .................................................................... 18
Gambar 2.16 Dashboard Operator Pertamina .......................................................................... 19
Gambar 2.17 Mockup Aplikasi PETROCHAIN ..................................................................... 19
Gambar 2.18 Mockup Dashboard Eksekutif Nasional PETROCHAIN .................................. 20
Gambar 2.19 Mockup Menu Audit Kepatuhan & Transparansi Data ..................................... 20
Gambar 2.20 Mockup Titik Distribusi Nasional dan Kinerja Operator................................... 21
Gambar 2.21 Mockup Dashboard Transparansi Dana Subsidi Energi .................................... 21
Gambar 2.22 Mockup Modul Detail Blok Transaksi (Audit Block Detail) ............................ 22
Gambar 2.23 Halaman Registrasi Kendaraan oleh Masyarakat .............................................. 23
Gambar 2.24 Hasil Verifikasi OCR dengan Status Tidak Sesuai ............................................ 23
Gambar 2.25 Hasil Verifikasi OCR dengan Status Sesuai ...................................................... 24
Gambar 2.26 Status Pengajuan Registrasi pada Aplikasi Pengguna ....................................... 24
Gambar 2.27 Hasil Validasi Kendaraan dengan Status QR Match ......................................... 25
Gambar 2.28 Hasil Validasi Kendaraan dengan Status QR Not Match .................................. 25
Gambar 2.29 Hasil Deteksi Kendaraan Roda Dua kategori under 250 cc ............................... 26
Gambar 2.30 Hasil Deteksi Kendaraan Roda Dua Kategori Over 250 cc ............................... 27
Gambar 2.31 Alur Tahapan Implementasi PETROCHAIN .................................................... 31

---

iv
### DAFTAR TABEL
Tabel 2.1 Permasalahan Aktual Implementasi MyPertamina .................................................... 8
Tabel 2.2 Peran Pihak - Pihak Yang Terkait............................................................................ 28
Tabel 2.3 Kontribusi Pihak-pihak yang Terkait ....................................................................... 29
Tabel 2.4 Keunggulan utama PETROCHAIN ......................................................................... 30

---

v
### DAFTAR LAMPIRAN
Lampiran 1. Surat Pernyataan .................................................................................................. 35

---

1
### BAB I
PENDAHULUAN
1.1 Latar Belakang
Subsidi Bahan Bakar Minyak (BBM) merupakan kebijakan pemerintah yang bertujuan
menjaga keterjangkauan harga bahan bakar bagi masyarakat, khususnya kelompok
berpenghasilan rendah, sekaligus mendukung kestabilan ekonomi nasional. Keberadaan
subsidi tidak hanya berfungsi menjaga daya beli masyarakat, tetapi juga mendukung aktivitas
ekonomi yang bergantung pada ketersediaan energi dengan harga terjangkau (Sa’diyah et al.,
2025). Namun, efektivitas penyaluran subsidi masih menjadi tantangan. Berdasarkan
Kementerian Keuangan Republik Indonesia, sekitar 80% subsidi energi masih dinikmati
kelompok masyarakat mampu, sedangkan masyarakat berpendapatan rendah hanya
memperoleh sekitar 20% manfaat subsidi. Kondisi serupa juga terjadi pada subsidi solar
rumah tangga, di mana sekitar 95% manfaat subsidi dinikmati kelompok mampu (Kristianus,
2022). Urgensi tersebut semakin meningkat seiring dengan terus bertambahnya anggaran
subsidi energi. Pada tahun 2024, pemerintah mengalokasikan subsidi energi sebesar Rp186,9
triliun dan meningkat menjadi Rp203,41 triliun pada tahun 2025 akibat kenaikan harga
minyak dunia, fluktuasi nilai tukar rupiah, serta meningkatnya kebutuhan energi nasional
(Adelia Gusfira, Hasanatun Fitri dan Ahmad Wahyudi Zein, 2025). Dengan besarnya
anggaran tersebut, penguatan sistem distribusi menjadi penting agar pengawasan penyaluran
subsidi dapat berjalan lebih efektif.
Sebagai upaya meningkatkan ketepatan sasaran distribusi BBM bersubsidi, pemerintah
melalui PT Pertamina Patra Niaga menerapkan sistem QR Code pada aplikasi MyPertamina
sebagai syarat pembelian Pertalite dan Solar bersubsidi (Royani, Aprianto dan Majesti, 2026).
Meskipun demikian, implementasinya masih menghadapi beberapa tantangan. Pada tahap
registrasi, proses verifikasi dokumen masih dilakukan secara manual dengan mencocokkan
data STNK dan foto kendaraan sehingga berpotensi memperlambat pelayanan ketika jumlah
pengajuan meningkat (Manaraja dan Rizal, 2025). Selain itu, pada tahap distribusi, sistem
masih berfokus pada verifikasi QR Code sehingga identitas fisik kendaraan belum tervalidasi
secara otomatis. BPH Migas juga menemukan adanya indikasi penggunaan satu QR Code
pada beberapa kendaraan yang berbeda (BPH Migas, 2023). Kondisi tersebut menunjukkan
bahwa sistem saat ini masih berfokus pada verifikasi identitas digital melalui QR Code,
sedangkan identitas fisik kendaraan yang datang ke SPBU belum diverifikasi secara otomatis.
Akibatnya, QR Code yang sah masih berpotensi digunakan oleh kendaraan lain melalui
praktik peminjaman maupun penyalahgunaan identitas.
Selain itu, Menteri Energi dan Sumber Daya Mineral (ESDM) periode 2019-2024, Arifin
Tasrif, menyatakan bahwa melalui revisi Peraturan Presiden Nomor 191 Tahun 2014 yang
mengatur kriteria kendaraan penerima BBM bersubsidi. Dalam kebijakan tersebut ditegaskan
bahwa kendaraan dengan kapasitas mesin tertentu, seperti mobil di atas 1.400 cc dan sepeda
motor di atas 250 cc, tidak lagi menjadi sasaran pengguna Pertalite bersubsidi. Kebijakan ini
bertujuan memastikan subsidi lebih tepat sasaran kepada masyarakat yang berhak (Amirullah,
2025). Namun, implementasinya di lapangan masih memerlukan mekanisme identifikasi

---

2
kendaraan yang mampu membantu proses pengawasan secara lebih efektif sehingga ketentuan
tersebut dapat diterapkan secara konsisten.
Di sisi lain, penguatan juga diperlukan pada aspek transparansi transaksi dan pelayanan
kepada masyarakat. Dari sisi pengawasan, data distribusi memerlukan mekanisme pencatatan
yang memiliki integritas tinggi sehingga setiap riwayat transaksi dapat ditelusuri ketika
diperlukan. Selain itu, meskipun aplikasi MyPertamina telah menyediakan informasi lokasi
SPBU dan jenis BBM, informasi mengenai kondisi stok BBM secara aktual belum tersedia
sehingga masyarakat masih berpotensi mengalami blind queuing (Ibrahim, 2018).
Berdasarkan berbagai permasalahan tersebut, diperlukan penguatan sistem distribusi
BBM bersubsidi tanpa mengubah mekanisme yang telah diterapkan pemerintah. Salah satu
pendekatan yang dapat digunakan adalah Automatic License Plate Recognition (ALPR) yang
menggabungkan algoritma YOLO sebagai pendeteksi objek dan OCR sebagai pengenal
karakter untuk melakukan identifikasi nomor polisi kendaraan secara otomatis (Shashirangana
et al., 2021). Pendekatan ini dapat dimanfaatkan baik untuk membantu verifikasi dokumen
registrasi maupun memvalidasi kesesuaian antara QR Code dan identitas fisik kendaraan saat
proses pengisian BBM. Selain itu, integrasi blockchain mampu meningkatkan integritas data
melalui pencatatan transaksi dalam bentuk immutable audit trail sehingga mendukung proses
audit distribusi secara lebih transparan (Alharbi et al., 2023). Setiap hasil identifikasi
kendaraan dan transaksi dapat direkam sebagai immutable audit trail, sehingga riwayat
transaksi menjadi lebih transparan dan tidak mudah diubah. Karakteristik tersebut dapat
mendukung proses audit distribusi BBM bersubsidi karena setiap transaksi memiliki rekam
jejak yang dapat ditelusuri oleh pihak yang berwenang.
Berdasarkan kondisi tersebut, penelitian ini mengusulkan PETROCHAIN, yaitu
platform pendukung (extension platform) bagi ekosistem MyPertamina yang memperkuat
proses distribusi BBM bersubsidi tanpa mengubah regulasi maupun mekanisme yang telah
berjalan. PETROCHAIN mengintegrasikan OCR untuk membantu verifikasi registrasi,
kombinasi YOLO–OCR untuk validasi kendaraan, blockchain sebagai audit trail, serta fitur
informasi stok BBM secara real-time. Melalui penguatan tersebut, diharapkan distribusi BBM
bersubsidi menjadi lebih tepat sasaran, transparan, efisien, dan mampu meningkatkan kualitas
pelayanan publik.
1.2 Tujuan
Berdasarkan latar belakang yang telah diuraikan, penelitian ini bertujuan untuk:
1. Mengembangkan mockup PETROCHAIN sebagai sistem pendukung (extension platform)
yang terintegrasi dengan MyPertamina guna memperkuat proses distribusi BBM
bersubsidi melalui peningkatan validasi, transparansi, dan kualitas pelayanan.
2. Mengimplementasikan teknologi OCR serta integrasi YOLO–OCR untuk mendukung
verifikasi dokumen registrasi, validasi identitas kendaraan saat pengisian BBM, serta
identifikasi kategori kendaraan sesuai ketentuan pemerintah guna meminimalkan potensi
penyalahgunaan subsidi.
3. Menerapkan teknologi Blockchain sebagai immutable audit trail untuk meningkatkan
integritas data transaksi, transparansi distribusi, serta mendukung proses pengawasan dan
audit BBM bersubsidi.

---

3
4. Menyediakan fitur informasi ketersediaan stok BBM secara real-time pada setiap SPBU
untuk meningkatkan kualitas pelayanan kepada masyarakat dan membantu mengurangi
antrean yang tidak diperlukan (blind queuing).
1.3 Manfaat
Penelitian ini diharapkan dapat memberikan manfaat baik secara teoretis maupun praktis.
Secara teoretis, penelitian ini diharapkan mampu memperkaya kajian mengenai penerapan
teknologi digital dalam mendukung tata kelola pelayanan publik. Sementara itu, secara
praktis, hasil penelitian ini diharapkan dapat menjadi alternatif penguatan sistem distribusi
BBM bersubsidi yang mendukung peningkatan transparansi, efisiensi, dan kualitas pelayanan
bagi pemerintah, PT Pertamina Patra Niaga, operator SPBU, serta masyarakat sebagai
pengguna layanan.
A. Manfaat Teoritis
1. Memberikan kontribusi dalam pengembangan kajian e-Government, khususnya
mengenai penguatan sistem digital pelayanan publik melalui pemanfaatan teknologi
OCR, YOLO, dan Blockchain.
2. Menjadi referensi bagi penelitian selanjutnya mengenai penerapan computer vision
dan Blockchain dalam mendukung transparansi serta peningkatan kualitas distribusi
BBM bersubsidi.
B. Manfaat Praktis
1. Bagi Pemerintah dan Lembaga Pengawas
Membantu meningkatkan transparansi distribusi BBM bersubsidi melalui sistem
pencatatan transaksi yang lebih mudah ditelusuri sehingga mendukung proses
pengawasan dan audit, termasuk mendukung pengawasan terhadap kesesuaian
kategori kendaraan penerima BBM bersubsidi berdasarkan regulasi yang berlaku.
2. Bagi PT Pertamina Patra Niaga dan Operator SPBU
Membantu mempercepat proses verifikasi pengajuan subsidi melalui otomatisasi
pemeriksaan dokumen, memperkuat validasi kendaraan saat pengisian BBM, serta
mempermudah pengelolaan informasi stok BBM di SPBU, serta mendukung proses
identifikasi kategori kendaraan bermotor sesuai ketentuan pemerintah sebagai bagian
dari pengawasan penyaluran BBM bersubsidi.
3. Bagi Masyarakat
Memberikan proses registrasi subsidi yang lebih efisien, meningkatkan kepastian
bahwa subsidi diterima oleh kendaraan yang berhak, serta menyediakan informasi
ketersediaan stok BBM secara real-time sehingga masyarakat dapat menentukan
lokasi pengisian yang sesuai.
1.4 Target Pengguna
Sesuai dengan ruang lingkupnya, PETROCHAIN dirancang untuk mendukung hubungan
antara pemerintah, pelaksana distribusi, dan masyarakat melalui tiga kategori pengguna
sebagai berikut.

---

4
A. Pemerintah dan Masyarakat (G2C)
Masyarakat menggunakan aplikasi untuk melakukan proses registrasi kendaraan
sebagai penerima BBM bersubsidi serta memperoleh informasi ketersediaan stok BBM di
setiap SPBU secara real-time. Selain itu, masyarakat memperoleh proses verifikasi pengajuan
subsidi yang lebih cepat melalui otomatisasi pemeriksaan dokumen.
B. Pemerintah dan Bisnis (G2B)
PT Pertamina Patra Niaga dan operator SPBU berperan sebagai pelaku bisnis dengan
memanfaatkan PETROCHAIN sebagai sistem pendukung dalam proses distribusi BBM
bersubsidi, meliputi validasi otomatis antara QR Code dan nomor polisi kendaraan saat
pengisian BBM, pengelolaan informasi ketersediaan stok BBM, serta pencatatan transaksi
distribusi. Selain itu, sistem membantu mengidentifikasi kategori kendaraan bermotor
menggunakan model YOLO sehingga proses pengawasan terhadap kendaraan yang tidak
memenuhi kriteria penerima BBM bersubsidi dapat dilakukan secara lebih efektif.
C. Pemerintah dan Pemerintah (G2G)
Instansi pemerintahan seperti BPH Migas, Kementerian Keuangan dan Kementerian
ESDM memanfaatkan dashboard PETROCHAIN untuk memantau data distribusi BBM
bersubsidi yang tersimpan dalam Blockchain, sehingga proses pengawasan dan audit transaksi
dapat dilakukan secara lebih transparan, akurat, dan mudah ditelusuri. Data hasil identifikasi
kategori kendaraan juga dapat dimanfaatkan sebagai informasi pendukung dalam evaluasi
kepatuhan terhadap kebijakan penyaluran BBM bersubsidi.

---

5
### BAB II
GAGASAN
2.1 Kondisi Aktual Objek Permasalahan
Keberhasilan distribusi BBM bersubsidi tidak hanya dipengaruhi oleh besarnya anggaran
yang dialokasikan pemerintah, tetapi juga oleh efektivitas mekanisme penyaluran, kepatuhan
terhadap regulasi, serta pemanfaatan teknologi yang mendukung transparansi dan ketepatan
sasaran distribusi (Triwibowo dan Pramono, 2025). Sebagai bagian dari transformasi digital,
pemerintah mengimplementasikan aplikasi MyPertamina untuk mendukung penyaluran BBM
bersubsidi secara lebih akuntabel (Wijaya et al., 2025).
Namun, berbagai hasil evaluasi menunjukkan bahwa implementasi sistem tersebut masih
menghadapi sejumlah tantangan, baik dari aspek teknis, infrastruktur, maupun pengalaman
pengguna sehingga efektivitas distribusi masih perlu terus ditingkatkan (Ayu Suraya,
Salsabila Zahira Putri dan Nurul Kamaly, 2025). Oleh karena itu, identifikasi terhadap kondisi
aktual distribusi BBM bersubsidi menjadi penting sebagai dasar dalam merumuskan
penguatan sistem melalui PETROCHAIN. Pembahasan pada sub-bab ini mencakup
perkembangan anggaran subsidi energi, efektivitas penyaluran, penguatan regulasi terbaru,
serta evaluasi implementasi digitalisasi MyPertamina.
2.1.1 Beban Subsidi Energi dan Tantangan Distribusi
Subsidi energi merupakan salah satu instrumen fiskal yang digunakan pemerintah untuk
menjaga keterjangkauan harga energi bagi masyarakat, khususnya kelompok yang berhak
menerima bantuan. Melalui Anggaran Pendapatan dan Belanja Negara (APBN), pemerintah
mengalokasikan anggaran subsidi energi dalam jumlah yang besar setiap tahunnya guna
menjaga stabilitas ekonomi nasional dan melindungi daya beli masyarakat terhadap fluktuasi
harga energi dunia (Adelia Gusfira, Hasanatun Fitri dan Ahmad Wahyudi Zein, 2025).
Bahkan pada tahun 2022, melalui Peraturan Presiden Nomor 98 Tahun 2022, pemerintah
menaikkan anggaran subsidi BBM dari awalnya Rp152 triliun pada APBN 2022 menjadi
Rp502,4 triliun (Sihombing, 2022). Besarnya alokasi anggaran tersebut menunjukkan bahwa
subsidi energi menjadi salah satu komponen penting dalam belanja negara dan terus
mengalami perubahan mengikuti dinamika harga energi global serta kebutuhan nasional.
Perkembangan beban negara untuk subsidi dan kompensasi BBM selama periode 2021–2025
ditunjukkan pada Gambar 2.1.

---

6
Gambar 2.1 Perkembangan Beban Negara untuk Subsidi BBM Tahun 2021–2025
Sumber : Kementerian Keuangan RI (2026)
Berdasarkan Gambar 2.1, anggaran subsidi energi meningkat dari Rp164,3 triliun pada
tahun 2023 menjadi Rp177,6 triliun pada tahun 2024 dan kembali meningkat menjadi Rp203,4
triliun pada APBN 2025. Peningkatan tersebut menunjukkan bahwa beban fiskal pemerintah
dalam menjaga keterjangkauan harga energi semakin besar sehingga efektivitas distribusi
subsidi menjadi aspek yang perlu terus diperkuat agar anggaran yang dialokasikan dapat
diterima oleh masyarakat yang benar-benar berhak.
2.1.2 Distribusi Subsidi BBM Masih Belum Optimal
Meskipun pemerintah terus melakukan perbaikan dalam mekanisme penyaluran BBM
bersubsidi, potensi salah sasaran masih menjadi tantangan yang signifikan. Berdasarkan hasil
analisis NEXT Indonesia Center terhadap data Survei Sosial Ekonomi Nasional (Susenas)
Maret 2024 yang diterbitkan oleh Badan Pusat Statistik (BPS), sekitar 1,4 miliar liter Pertalite
per bulan atau 78,93% dari total konsumsi rumah tangga berpotensi dinikmati oleh kelompok
masyarakat yang tidak menjadi sasaran utama subsidi. Analisis tersebut juga menunjukkan
bahwa sebagian besar konsumsi Pertalite berasal dari rumah tangga pada kelompok desil 5–
10, bahkan sekitar 20% rumah tangga terkaya (desil 9–10) mengonsumsi hampir 39,99% dari
total BBM jenis Pertalite. Temuan tersebut menunjukkan bahwa efektivitas penyaluran
subsidi masih perlu ditingkatkan agar manfaat subsidi benar-benar diterima oleh masyarakat
yang berhak (Desk, 2025).
Dalam implementasinya, subsidi ini sering tidak tepat sasaran karena sebagian besar
manfaatnya justru dinikmati oleh kelompok masyarakat berpenghasilan tinggi, sementara
kelompok miskin menerima bagian yang jauh lebih kecil. Dengan demikian, subsidi BBM
menjadi beban yang signifikan bagi negara dan menimbulkan berbagai tantangan salah
satunya di bidang ekonomi yang harus dikelola dengan hati-hati (Soesanto, Komansilan dan
Salsabillah, 2025).
2.1.3 Dinamika Regulasi Distribusi BBM Bersubsidi
Selama beberapa tahun terakhir, distribusi BBM bersubsidi diatur melalui Peraturan
Presiden Nomor 191 Tahun 2014 tentang Penyediaan, Pendistribusian, dan Harga Jual Eceran
BBM. Regulasi tersebut menjadi dasar dalam penetapan kelompok pengguna BBM bersubsidi

---

7
serta mekanisme penyalurannya. Seiring meningkatnya beban subsidi dan masih
ditemukannya potensi penyalahgunaan distribusi, pemerintah terus melakukan evaluasi
terhadap kebijakan tersebut agar penyaluran BBM bersubsidi semakin tepat sasaran (Prasetio,
2026).
Seiring dengan upaya pemerintah meningkatkan ketepatan sasaran distribusi BBM
bersubsidi, dilakukan penyempurnaan kebijakan melalui revisi Peraturan Presiden Nomor 191
Tahun 2014 yang mulai diterapkan pada tahun 2026. Kebijakan tersebut mempertegas kriteria
kendaraan yang berhak memperoleh BBM bersubsidi, termasuk pembatasan penggunaan
Pertalite bagi kendaraan roda empat dengan kapasitas mesin di atas 1.400 cc serta kendaraan
roda dua dengan kapasitas mesin di atas 250 cc (Kaniza, 2026). Regulasi tersebut bertujuan
agar subsidi energi benar-benar diterima oleh masyarakat yang memenuhi kriteria penerima.
2.1.4 Tantangan Implementasi Digitalisasi MyPertamina
MyPertamina adalah aplikasi yang diluncurkan dalam rangka program digitalisasi
Stasiun Pengisian Bahan Bakar Umum (SPBU). Menyadari pergeseran kebiasaan dari
masyarakat, PT Pertamina juga meningkatkan pelayanan dengan mengeluarkan aplikasi
digital dalam hal pembelian BBM, subsidi. Tujuannya agar pendistribusian BBM bersubsidi
tersebut tepat sasaran (Chantika, Gustini dan Charolina, 2024).
Meskipun demikian, berbagai hasil evaluasi menunjukkan bahwa efektivitas
digitalisasi tersebut masih dipengaruhi oleh kualitas proses verifikasi dan pengawasan. Putra
dan Irawati (2025) menjelaskan bahwa lemahnya verifikasi data serta masih adanya celah
dalam mekanisme pengawasan dapat membuka peluang terjadinya penyalahgunaan identitas
penerima subsidi. Oleh karena itu, diperlukan penguatan integrasi data, mekanisme verifikasi,
serta sistem pengawasan yang lebih komprehensif agar proses distribusi BBM bersubsidi
dapat berjalan secara lebih akurat, transparan, dan sesuai dengan ketentuan yang berlaku.
Berdasarkan berbagai hasil evaluasi implementasi MyPertamina, masih terdapat
beberapa kendala yang memengaruhi efektivitas distribusi BBM bersubsidi. Permasalahan
tersebut meliputi proses registrasi, validasi kendaraan, transparansi transaksi, hingga
penyampaian informasi kepada masyarakat. Ringkasan permasalahan tersebut disajikan pada
Tabel 2.1.

---

8
Tabel 2.1 Permasalahan Aktual Implementasi MyPertamina
No Permasalahan Dampak
1 Verifikasi registrasi masih
memerlukan pemeriksaan
administrasi.
Proses persetujuan pengajuan
subsidi menjadi lebih lama.
2 Verifikasi saat pengisian masih
berfokus pada identitas digital.
Diperlukan penguatan pencocokan
dengan identitas fisik kendaraan
agar meminimalkan potensi
penyalahgunaan.
3 Implementasi regulasi kendaraan
penerima subsidi masih
memerlukan dukungan identifikasi
otomatis di lapangan.
Pengawasan terhadap kendaraan
yang tidak memenuhi kriteria
memerlukan proses pemeriksaan
tambahan.
4 Pencatatan transaksi memerlukan
mekanisme audit yang lebih kuat.
Penelusuran riwayat distribusi
belum optimal.
5 Informasi stok BBM belum
tersedia secara aktual.
Masyarakat berpotensi mengalami
blind queueing.
Berdasarkan Tabel 2.1, sebagian besar permasalahan tidak disebabkan oleh mekanisme
distribusi utama, melainkan pada proses pendukung seperti verifikasi administrasi, validasi
identitas kendaraan, transparansi pencatatan transaksi, dan penyediaan informasi kepada
masyarakat. Kondisi tersebut menjadi dasar dalam pengembangan PETROCHAIN sebagai
platform pendukung untuk memperkuat ekosistem MyPertamina.
2.2 Inovasi Teknologi yang Digunakan pada PETROCHAIN
Berbeda dengan penelitian yang berupaya membangun sistem distribusi baru,
PETROCHAIN dirancang sebagai platform pendukung (extension) yang memperkuat
ekosistem MyPertamina tanpa mengubah regulasi maupun mekanisme distribusi BBM
bersubsidi yang telah diterapkan pemerintah. Penguatan dilakukan pada lima tahapan utama
distribusi BBM bersubsidi, yaitu tahap registrasi pengguna, tahap validasi kendaraan roda
empat dan roda dua, tahap pencatatan transaksi, dan tahap penyampaian informasi kepada
masyarakat. Arsitektur logika sistem terintegrasi dari platform PETROCHAIN disajikan pada
Gambar 2.2 berikut.

---

9
Gambar 2.2 Logika Sistem Terintegrasi PETROCHAIN
Berdasarkan Gambar 2.2, ekosistem PETROCHAIN membagi alur kerja operasional
ke dalam beberapa kluster fungsionalitas pendukung yang saling berkesinambungan secara
mendetail, yang dijabarkan pada subbab di bawah ini.

---

10
2.2.1 Penguatan Proses Registrasi Menggunakan OCR Assisted Registration
Tahap pertama dalam distribusi BBM bersubsidi dimulai ketika masyarakat melakukan
registrasi kendaraan melalui aplikasi MyPertamina. Pada proses ini petugas harus memastikan
kesesuaian data STNK dengan foto kendaraan yang diunggah sebelum permohonan disetujui.
Semakin banyak jumlah pengajuan yang masuk, semakin besar pula waktu yang dibutuhkan
petugas untuk melakukan pemeriksaan secara manual. Kondisi tersebut menyebabkan proses
persetujuan sangat bergantung pada kecepatan pemeriksaan administrator.
Untuk membantu proses tersebut, PETROCHAIN menghadirkan fitur OCR Assisted
Registration sebagai asisten verifikasi administrasi. Sistem memanfaatkan teknologi OCR
untuk mengekstraksi informasi pada dokumen STNK sekaligus membaca nomor polisi pada
foto kendaraan. Hasil pembacaan kemudian dibandingkan secara otomatis sehingga
administrator hanya melakukan validasi akhir terhadap hasil yang diberikan sistem. Pada
Gambar 2.3 ditunjukkan proses alur kerja OCR Assisted Registration pada PETROCHAIN
dirancang untuk membantu administrator melakukan verifikasi dokumen secara lebih efisien.
Gambar 2.3 Flow OCR Assisted Registration
Berdasarkan Gambar 2.3, sistem terlebih dahulu mengekstraksi informasi pada dokumen
STNK dan foto kendaraan menggunakan OCR. Selanjutnya hasil ekstraksi dibandingkan
secara otomatis sebelum ditampilkan kepada administrator untuk dilakukan validasi akhir
(human-in-the-loop).
2.2.2 Penguatan Validasi Kendaraan Menggunakan YOLO–OCR
Setelah QR Code diterbitkan, proses pengisian BBM di SPBU masih mengandalkan
QR Code sebagai identitas utama kendaraan. Mekanisme tersebut telah mampu memverifikasi
identitas digital pengguna, namun belum disertai proses validasi otomatis terhadap identitas
fisik kendaraan yang melakukan pengisian. Akibatnya, masih terdapat potensi
penyalahgunaan QR Code apabila identitas kendaraan tidak diverifikasi secara langsung di
lapangan.
PETROCHAIN mengatasi permasalahan tersebut dengan menerapkan mekanisme
validasi ganda menggunakan kombinasi algoritma YOLO dan OCR. Kamera yang dipasang
pada dispenser terlebih dahulu mendeteksi posisi pelat nomor kendaraan menggunakan
YOLO. Setelah lokasi pelat berhasil ditemukan, OCR membaca karakter nomor polisi dan
membandingkannya dengan data nomor polisi yang tersimpan pada QR Code MyPertamina.
Kombinasi algoritma YOLO dan OCR telah terbukti mampu mendeteksi serta mengekstraksi

---

11
karakter pelat nomor kendaraan dengan tingkat akurasi yang tinggi, sehingga sesuai
digunakan untuk proses validasi kendaraan secara otomatis di lapangan (Sunarta et al., 2025).
Bentuk proses tersebut disajikan pada Gambar 2.4.
Gambar 2.4 Flow validasi kendaraan
Pengisian BBM hanya dapat dilanjutkan apabila kedua identitas tersebut sesuai
sehingga proses distribusi memperoleh lapisan validasi tambahan tanpa mengubah
mekanisme penggunaan QR Code yang telah diterapkan pemerintah.
2.2.3 Penguatan Transparansi Audit Menggunakan Blockchain
Setelah transaksi berhasil dilakukan, data distribusi perlu disimpan secara aman agar
dapat digunakan sebagai dasar pengawasan dan audit. PETROCHAIN mengintegrasikan
teknologi Blockchain sebagai media pencatatan transaksi sehingga setiap transaksi yang telah
lolos proses validasi akan direkam sebagai immutable audit trail. Dengan karakteristik
tersebut, riwayat transaksi menjadi lebih transparan, tidak mudah diubah, dan dapat ditelusuri
kembali ketika diperlukan oleh instansi pengawas.
Pendekatan ini didukung oleh penelitian Nugroho dkk. (2025) yang menerapkan
private blockchain berbasis Multichain pada sistem distribusi LPG bersubsidi. Penelitian
tersebut menunjukkan bahwa teknologi blockchain mampu meningkatkan transparansi,
akuntabilitas, serta keterlacakan (traceability) transaksi sehingga dapat meminimalkan
potensi penyimpangan dalam penyaluran subsidi. Selain itu, Haryani dkk. (2025) juga
menegaskan bahwa teknologi blockchain memiliki potensi untuk diterapkan pada sektor
energi lainnya, termasuk minyak dan gas, karena memiliki kebutuhan terhadap integritas data
dan keterlacakan transaksi yang serupa. Temuan tersebut menjadi landasan bahwa penerapan
blockchain pada PETROCHAIN relevan untuk mendukung pengawasan distribusi BBM
bersubsidi. Bentuk mekanisme pencatatan transaksi pada PETROCHAIN ditunjukkan pada
Gambar 2.5.

---

12
Gambar 2.5 Diagram alur Blockchain
Berdasarkan Gambar 2.5, setiap transaksi BBM yang telah melewati proses validasi
akan diteruskan ke jaringan blockchain untuk dicatat sebagai blok baru. Data yang telah
tersimpan membentuk riwayat transaksi yang saling terhubung dan tidak dapat diubah tanpa
memengaruhi keseluruhan rantai blok, sehingga menghasilkan audit trail yang aman,
transparan, dan mudah ditelusuri oleh instansi pengawas. Pemanfaatan Blockchain pada
PETROCHAIN bukan untuk menggantikan basis data yang telah dimiliki MyPertamina,
melainkan sebagai lapisan tambahan yang meningkatkan integritas data transaksi.
2.2.4 Penguatan Validasi Kendaraan Roda Dua (Motor) Berdasarkan Kapasitas Mesin
Menggunakan YOLO
Selain pengawasan pada kendaraan roda 4, pembatasan ketat juga menyasar kluster
pengguna kendaraan roda dua (motor). Berdasarkan regulasi terbaru, kendaraan roda dua
dengan kapasitas mesin di atas 250 cc tidak diperbolehkan menerima BBM bersubsidi. Ketika
pengendara roda dua tiba di SPBU (Jalur Roda 2), PETROCHAIN menambahkan fitur
identifikasi visual berbasis You Only Look Once (YOLO) sebagai instrumen penegak
kebijakan otomatis. Model YOLO dilatih menggunakan dataset berbagai jenis karakteristik
motor sehingga mampu mengenali secara instan tipe spesifik motor yang datang ke dispenser.
Hasil identifikasi visual tipe motor tersebut kemudian dicocokkan dengan basis data
spesifikasi pabrikan untuk mendeteksi kapasitas mesinnya.
Pendekatan ini didukung oleh penelitian Iskandar Mulyana dan Rofik (2022) yang
menunjukkan bahwa YOLOv5 mampu mendeteksi dan mengklasifikasikan berbagai jenis
kendaraan secara real-time pada kondisi jalan raya di Indonesia. Selain itu, He dkk. (2024)
juga membuktikan bahwa model YOLOv5s memiliki kemampuan deteksi sepeda motor
dengan akurasi yang tinggi, sehingga sesuai diterapkan pada proses identifikasi kendaraan
roda dua secara otomatis. Temuan tersebut menjadi landasan penggunaan YOLO pada

---

13
PETROCHAIN untuk mengenali tipe kendaraan sebelum dicocokkan dengan basis data
spesifikasi kapasitas mesin. Alur kerja fitur tersebut ditunjukkan pada Gambar 2.6.
Gambar 2.6 Alur Logika Sistem Yolo pada Kendaraan Roda Dua
Berdasarkan Gambar 2.6, citra kendaraan yang memasuki Jalur Roda 2 ditangkap oleh
kamera, kemudian diproses menggunakan model YOLO untuk mengidentifikasi tipe
kendaraan. Hasil identifikasi selanjutnya dibandingkan dengan basis data spesifikasi
kendaraan. Apabila kendaraan teridentifikasi memiliki kapasitas mesin di atas 250 cc, sistem
memberikan notifikasi kepada operator sebagai dasar penerapan ketentuan pengisian BBM
bersubsidi sesuai regulasi yang berlaku. Integrasi fitur ini menjadi lapisan validasi tambahan
yang membantu operator SPBU menerapkan kebijakan pemerintah secara lebih konsisten,
cepat, dan objektif tanpa mengubah mekanisme distribusi BBM bersubsidi yang telah
berjalan.
2.2.5 Penyediaan Informasi Ketersediaan BBM
Selain penguatan pada proses distribusi, PETROCHAIN juga meningkatkan kualitas
pelayanan kepada masyarakat melalui penyediaan informasi kondisi stok BBM. Saat ini
aplikasi MyPertamina telah menyediakan informasi lokasi SPBU dan jenis BBM yang
tersedia, namun belum menampilkan kondisi ketersediaan stok secara aktual. Akibatnya
masyarakat berpotensi mendatangi SPBU yang stok BBM subsidinya telah habis sehingga
menimbulkan antrean yang tidak diperlukan (blind queuing).
Untuk mengatasi kondisi tersebut, PETROCHAIN menyediakan fitur pembaruan status
stok yang dapat diakses oleh administrator SPBU. Administrator cukup memilih status
"Tersedia" atau "Habis", kemudian informasi tersebut langsung ditampilkan kepada
masyarakat melalui aplikasi MyPertamina. Pendekatan ini dipilih karena sederhana, mudah
diterapkan tanpa penambahan perangkat keras baru, serta tetap mampu membantu masyarakat
mengambil keputusan sebelum menuju SPBU. Alur kerja fitur tersebut ditunjukkan pada
Gambar 2.7.

---

14
Gambar 2.7 Flow update stok dari Admin
Berdasarkan Gambar 2.7, informasi ketersediaan BBM diperbarui secara real-time oleh
operator SPBU melalui dashboard operator. Data yang diinput kemudian dikirim ke server
untuk diproses dan disinkronkan sehingga status ketersediaan BBM dapat ditampilkan pada
aplikasi pengguna. Dengan adanya mekanisme ini, masyarakat dapat mengetahui kondisi stok
di beberapa SPBU sebelum melakukan perjalanan, sehingga dapat memilih lokasi pengisian
yang sesuai dan mengurangi potensi antrean akibat ketidakpastian ketersediaan BBM.
2.3 Rancangan Mockup Implementasi Gagasan PETROCHAIN
Sebagai gambaran implementasi dari sistem yang diusulkan, PETROCHAIN dirancang
memiliki beberapa antarmuka yang disesuaikan dengan kebutuhan masing-masing pengguna.
Mockup ini bertujuan memberikan ilustrasi mengenai bagaimana setiap fitur
diimplementasikan ke dalam platform tanpa mengubah alur distribusi BBM bersubsidi yang
telah diterapkan pemerintah. Mockup tersebut meliputi dashboard utama, dashboard
administrator Pertamina, dashboard operator SPBU, serta aplikasi mobile bagi masyarakat.
1. Mockup Dashboard Website
Sebagai media informasi utama, PETROCHAIN dirancang memiliki halaman landing
page yang berfungsi memperkenalkan konsep sistem kepada masyarakat maupun pemangku
kepentingan. Halaman ini menyajikan informasi mengenai tujuan pengembangan sistem,
teknologi yang digunakan, serta akses menuju layanan registrasi kendaraan subsidi.
Rancangan antarmuka Website ditunjukkan pada Gambar 2.8.

---

15
Gambar 2.8 Landing Page Website
Pada Gambar 2.8, Landing page berfungsi sebagai halaman utama yang memberikan
informasi mengenai tujuan, fitur, dan teknologi yang digunakan dalam PETROCHAIN
kepada masyarakat. Halaman ini juga menyediakan akses bagi pengguna untuk melakukan
registrasi kendaraan dan memperoleh informasi terkait layanan sistem.
2. Mockup Website Admin Pertamina
Untuk mendukung proses pengelolaan distribusi BBM bersubsidi, PETROCHAIN
menyediakan dashboard administrator yang digunakan oleh petugas Pertamina dalam
melakukan pemantauan data registrasi, transaksi, dan aktivitas sistem secara terpusat.
Rancangan antarmuka website administrator disajikan pada Gambar 2.9 sampai Gambar 2.15.
Gambar 2.9 Landing Page Website Admin Pertamina
Berdasarkan Gambar 2.9, halaman dashboard menyajikan ringkasan aktivitas distribusi
BBM bersubsidi, seperti jumlah SPBU aktif, transaksi harian, operator terdaftar, dan hasil

---

16
audit OCR. Informasi tersebut membantu administrator memantau kondisi sistem secara cepat
melalui satu tampilan terpusat.
Gambar 2.10 Mockup Laporan Keuangan dan Pemasukan Global
Berdasarkan Gambar 2.10, sistem menyediakan laporan keuangan dan pemasukan yang
disajikan dalam bentuk ringkasan statistik dan grafik. Data tersebut dapat dimanfaatkan
sebagai bahan evaluasi kinerja operasional serta penyusunan laporan secara berkala.
Gambar 2.11 Halaman Monitor Semua Transaksi Global dan Log Transaksi
Gambar 2.11 menampilkan menu transaksi dan audit yang menunjukkan riwayat
seluruh aktivitas distribusi BBM beserta status validasi sistem secara real-time. Melalui
halaman ini, administrator dapat memantau log transaksi sekaligus mengidentifikasi aktivitas
yang memerlukan pemeriksaan lebih lanjut.

---

17
Gambar 2.12 Panel Transaksi & Audit Transparansi
Berdasarkan Gambar 2.12, sistem menampilkan hasil audit transaksi yang terindikasi
anomali, seperti ketidaksesuaian OCR, transaksi ganda, maupun dugaan pelat nomor palsu.
Administrator dapat meninjau hasil deteksi AI sebelum menentukan tindakan lanjutan
terhadap transaksi tersebut.
Gambar 2.13 Halaman Monitor Daftar Operator SPBU Aktif
Berdasarkan Gambar 2.13 di atas, halaman ini digunakan untuk mengelola data SPBU
dan operator yang terdaftar, termasuk informasi wilayah, kapasitas, status operasional, serta
performa validasi masing-masing operator. Fitur ini mendukung pengelolaan sumber daya
secara terpusat dan terstruktur.

---

18
Gambar 2.14 Halaman Manajemen Data Wilayah SPBU dan Operator
Gambar 2.14 menunjukkan halaman pengelolaan data SPBU dan operator yang
digunakan untuk menambah, memperbarui, serta memantau status operasional setiap SPBU.
Fitur ini memudahkan administrator dalam mengelola data operasional secara terintegrasi.
Gambar 2.15 Mockup website Admin Pertamina
Dashboard pada Gambar 2.15 menyajikan ringkasan kondisi operasional sistem,
termasuk aktivitas distribusi BBM, notifikasi audit, serta monitoring pengguna dalam satu
tampilan terintegrasi. Informasi tersebut membantu administrator memantau kinerja sistem
dan mengambil keputusan secara lebih cepat.
3. Mockup Website Operator Pertamina
Selain administrator pusat, sistem juga menyediakan antarmuka khusus bagi operator
SPBU yang bertugas melaksanakan proses validasi kendaraan dan memperbarui informasi
layanan di lapangan. Antarmuka ini dirancang sederhana agar mudah digunakan dalam
aktivitas operasional sehari-hari. Rancangannya ditunjukkan pada Gambar 2.16.

---

19
Gambar 2.16 Dashboard Operator Pertamina
Gambar 2.16 menunjukkan dashboard operator SPBU yang digunakan untuk
memperbarui status ketersediaan BBM, melihat riwayat transaksi, serta melakukan
pemindaian QR Code saat proses pengisian. Halaman ini mendukung operasional harian
SPBU agar berjalan lebih efisien dan terintegrasi dengan sistem PETROCHAIN.
4. Mockup Aplikasi PETROCHAIN
Interaksi masyarakat dengan sistem dilakukan melalui aplikasi mobile PETROCHAIN
yang terintegrasi dengan layanan MyPertamina. Aplikasi ini dirancang untuk memudahkan
pengguna dalam melakukan registrasi kendaraan, mengakses QR Code, serta memperoleh
informasi layanan distribusi BBM bersubsidi. Rancangan antarmuka aplikasi ditampilkan
pada Gambar 2.17.
Gambar 2.17 Mockup Aplikasi PETROCHAIN

---

20
Berdasarkan Gambar 2.17, aplikasi menyediakan beberapa fitur utama, antara lain
registrasi kendaraan, tampilan QR Code pengguna, riwayat transaksi pengisian BBM,
informasi ketersediaan stok BBM di SPBU, serta notifikasi terkait layanan subsidi. Dengan
adanya fitur tersebut, masyarakat dapat memperoleh informasi yang lebih lengkap sekaligus
mendukung proses distribusi BBM bersubsidi yang lebih transparan dan tepat sasaran.
5. Mockup Website Auditor
Guna memfasilitasi peran pengawasan makro oleh pihak otoritas seperti BPH Migas,
PETROCHAIN menyediakan antarmuka berbasis web dashboard khusus eksekutif. Sistem
ini dirancang dengan prinsip Read-Only Mode terenkripsi untuk menyajikan data distribusi
nasional secara transparan dan real-time. Halaman utama yang pertama kali ditampilkan
kepada auditor disajikan pada Gambar 2.18.
Gambar 2.18 Mockup Dashboard Eksekutif Nasional PETROCHAIN
Melalui tampilan pada Gambar 2.18, auditor dapat memantau indikator utama distribusi
BBM bersubsidi, seperti total SPBU aktif, operator terdaftar, jumlah transaksi, serta notifikasi
audit yang memerlukan tindak lanjut. Dashboard juga dilengkapi grafik dan ringkasan
aktivitas sehingga memudahkan proses monitoring kondisi distribusi secara menyeluruh.
Selanjutnya, auditor dapat beralih ke halaman transaksi dan audit sebagaimana ditunjukkan
pada Gambar 2.19 untuk meninjau aktivitas distribusi yang terjadi di seluruh SPBU.
Gambar 2.19 Mockup Menu Audit Kepatuhan & Transparansi Data

---

21
Berdasarkan Gambar 2.19, halaman ini menampilkan riwayat transaksi BBM beserta
informasi waktu, lokasi SPBU, nomor polisi, jenis BBM, volume pengisian, dan status hasil
validasi. Melalui informasi tersebut, auditor dapat mengidentifikasi transaksi yang telah
terverifikasi maupun transaksi yang memerlukan pemeriksaan lebih lanjut. Selain melakukan
audit transaksi, sistem juga menyediakan halaman pengelolaan SPBU dan operator
sebagaimana ditunjukkan pada Gambar 2.20.
Gambar 2.20 Mockup Titik Distribusi Nasional dan Kinerja Operator
Pada Gambar 2.20, auditor dapat memantau data SPBU yang terdaftar, kapasitas
penyimpanan, status operasional, serta informasi operator yang bertugas pada masing-masing
SPBU. Halaman ini membantu memastikan kondisi operasional dan kinerja petugas dapat
dipantau secara terpusat. Seluruh aktivitas distribusi tersebut kemudian dilengkapi dengan
modul pelaporan keuangan sebagaimana disajikan pada Gambar 2.21.
Gambar 2.21 Mockup Dashboard Transparansi Dana Subsidi Energi
Melalui tampilan pada Gambar 2.21, auditor memperoleh informasi mengenai
rekapitulasi pemasukan, laporan transaksi, serta visualisasi grafik keuangan yang dapat
diekspor menjadi dokumen PDF atau Excel. Penyajian data secara terintegrasi ini mendukung
proses evaluasi dan pengawasan distribusi BBM bersubsidi secara lebih transparan dan
akuntabel. Melalui integrasi teknologi ini, auditor dapat langsung mengidentifikasi status

---

22
keamanan setiap aktivitas distribusi di lapangan. Untuk melakukan penelusuran forensik lebih
mendalam terhadap suatu transaksi spesifik, auditor dapat membuka jendela detail enkripsi
blok seperti yang ditampilkan pada Gambar 2.22.
Gambar 2.22 Mockup Modul Detail Blok Transaksi (Audit Block Detail)
Berdasarkan tampilan pada Gambar 2.22, sistem menyajikan struktur data internal dari
Block #48201 secara transparan. Jendela ini menampilkan nilai SHA-256 Hash, Previous
Hash, dan Digital Signature pada kluster kriptografi untuk menjamin data bebas dari
manipulasi. Selain itu, bagian Data Payload menyajikan informasi riil seperti nomor pelat,
kode SPBU, dan volume pengisian dalam format JSON, yang diperkuat oleh indikator validasi
hijau di bagian bawah untuk memastikan seluruh data telah sesuai dengan konsensus jaringan
blockchain.
2.4 Mekanisme Operasional pada PETROCHAIN
Secara operasional, PETROCHAIN bekerja mengikuti tahapan distribusi BBM
bersubsidi yang telah diterapkan pemerintah dengan menambahkan mekanisme validasi dan
pengawasan sebagai lapisan pendukung tanpa mengubah prosedur utama yang telah berjalan.
Proses diawali ketika masyarakat melakukan registrasi kendaraan melalui aplikasi
MyPertamina dengan mengunggah dokumen STNK beserta foto kendaraan sebagai
persyaratan pengajuan subsidi, sebagaimana ditunjukkan pada Gambar 2.23. Dokumen yang
diunggah tersebut kemudian dikirim ke server PETROCHAIN untuk diproses menggunakan
teknologi Optical Character Recognition (OCR). Sistem secara otomatis mengekstraksi
informasi nomor polisi dari dokumen STNK dan membaca nomor polisi yang tampak pada
foto kendaraan sebagai proses verifikasi awal sebelum dilakukan pemeriksaan oleh
administrator. Apabila proses pemeriksaan masih berlangsung, sistem akan menampilkan
status "Menunggu Review".

---

23
Gambar 2.23 Halaman Registrasi Kendaraan oleh Masyarakat
Hasil ekstraksi OCR selanjutnya ditampilkan pada dashboard administrator sebagai
bahan pendukung dalam proses peninjauan pengajuan. Apabila nomor polisi yang terbaca dari
dokumen STNK dan foto kendaraan menunjukkan hasil yang berbeda, sistem akan
memberikan status "Tidak Sama" sebagaimana ditunjukkan pada Gambar 2.24. Informasi
tersebut menjadi rekomendasi awal bagi administrator untuk menolak pengajuan atau
meminta pengguna melakukan unggah ulang dokumen. Dengan mekanisme ini, administrator
tidak lagi melakukan pemeriksaan secara manual dari awal, tetapi cukup melakukan validasi
akhir terhadap hasil analisis yang telah diberikan oleh sistem.
Gambar 2.24 Hasil Verifikasi OCR dengan Status Tidak Sesuai
Sebaliknya, apabila hasil ekstraksi OCR menunjukkan nomor polisi pada dokumen
STNK dan foto kendaraan identik, sistem secara otomatis memberikan status "Sama"
sebagaimana terlihat pada Gambar 2.25. Status tersebut menjadi indikasi bahwa data registrasi
telah sesuai sehingga administrator dapat memberikan persetujuan (approval) terhadap
pengajuan kendaraan. Pendekatan human-in-the-loop ini membantu mempercepat proses
registrasi sekaligus mengurangi potensi human error pada proses pemeriksaan dokumen,

---

24
karena administrator berperan sebagai pengambil keputusan akhir berdasarkan hasil
rekomendasi sistem.
Gambar 2.25 Hasil Verifikasi OCR dengan Status Sesuai
Setelah proses verifikasi selesai dilakukan, pengguna dapat memantau perkembangan
status pengajuan secara langsung melalui aplikasi, sebagaimana ditampilkan pada Gambar
2.26. Jika ditemukan ketidaksesuaian data, pengguna memperoleh status "Validasi Ditolak"
sehingga dapat memperbaiki dokumen dan mengajukan kembali. Sebaliknya, apabila
pengajuan disetujui, sistem menerbitkan QR Code sebagai identitas digital kendaraan yang
selanjutnya digunakan pada proses pengisian BBM bersubsidi di SPBU.
Gambar 2.26 Status Pengajuan Registrasi pada Aplikasi Pengguna
Ketika kendaraan yang telah terdaftar melakukan pengisian BBM di SPBU, QR Code
digunakan sebagai identitas digital sebagaimana mekanisme yang telah diterapkan pada
MyPertamina. Untuk memperkuat proses tersebut, PETROCHAIN menambahkan validasi
fisik kendaraan menggunakan kombinasi algoritma YOLO dan OCR. Kamera yang terpasang
pada dispenser mendeteksi lokasi pelat nomor kendaraan menggunakan YOLO, kemudian

---

25
OCR membaca karakter nomor polisi untuk dibandingkan secara otomatis dengan nomor
polisi yang tersimpan pada QR Code.
Gambar 2.27 Hasil Validasi Kendaraan dengan Status QR Match
Pada kondisi sebagaimana ditunjukkan pada Gambar 2.27, nomor polisi hasil
pembacaan OCR sesuai dengan data nomor polisi yang tersimpan pada QR Code sehingga
sistem memberikan status "QR Match". Kesesuaian antara identitas fisik kendaraan dan
identitas digital tersebut memungkinkan proses pengisian BBM dilanjutkan. Dengan
demikian, PETROCHAIN menambahkan lapisan keamanan baru tanpa mengubah mekanisme
penggunaan QR Code yang telah diterapkan pemerintah.
Gambar 2.28 Hasil Validasi Kendaraan dengan Status QR Not Match

---

26
Sebaliknya, apabila nomor polisi hasil deteksi kamera tidak sesuai dengan data pada
QR Code sebagaimana ditunjukkan pada Gambar 2.28, sistem akan memberikan status "QR
Not Match". Kondisi ini mengindikasikan adanya ketidaksesuaian antara kendaraan yang
hadir di SPBU dengan identitas digital yang digunakan. Selanjutnya sistem mengirimkan
notifikasi kepada operator SPBU agar transaksi ditinjau kembali sebelum proses pengisian
BBM dilakukan. Mekanisme tersebut membantu meminimalkan potensi penyalahgunaan QR
Code serta meningkatkan ketepatan penyaluran BBM bersubsidi.
Berbeda dengan kendaraan roda empat yang memiliki regulasi QR, saat ini kendaraan
roda dua masih belum terdapat kebijakan khusus. Namun, terdapat pembatasan bahwa hanya
kategori kendaraan di bawah 250 cc yang dapat menerima subsidi. Pada PETROCHAIN
terdapat fitur untuk memvalidasi proses pengisian BBM.
Gambar 2.29 Hasil Deteksi Kendaraan Roda Dua kategori under 250 cc
Kemampuan model dalam mengenali kendaraan yang masih memenuhi ketentuan
penerima subsidi ditunjukkan pada Gambar 2.29. Model YOLO berhasil mendeteksi
kendaraan kategori under 250 cc dengan memberikan label kelas beserta nilai confidence pada
setiap objek yang teridentifikasi. Informasi hasil deteksi selanjutnya diteruskan ke sistem
PETROCHAIN sebagai dasar untuk mengizinkan proses pengisian BBM bersubsidi apabila
seluruh tahapan validasi lainnya juga telah terpenuhi. Dengan mekanisme tersebut, proses
verifikasi berlangsung secara otomatis tanpa menambah beban pemeriksaan bagi operator
SPBU.

---

27
Gambar 2.30 Hasil Deteksi Kendaraan Roda Dua Kategori Over 250 cc
Sebaliknya, kemampuan sistem dalam mendeteksi kendaraan yang tidak memenuhi
kriteria penerima subsidi ditunjukkan pada Gambar 2.30. Model YOLO berhasil
mengidentifikasi kendaraan kategori over 250 cc, kemudian mengklasifikasikannya sebagai
kendaraan yang tidak memenuhi ketentuan penerima BBM bersubsidi sesuai regulasi yang
berlaku. Hasil identifikasi tersebut diteruskan ke sistem PETROCHAIN sebagai dasar untuk
memberikan instruksi agar dispenser tidak mengaktifkan proses pengisian BBM bersubsidi.
Dengan demikian, kebijakan pembatasan kendaraan berdasarkan kapasitas mesin dapat
diterapkan secara lebih konsisten, cepat, dan objektif tanpa bergantung sepenuhnya pada
pengawasan manual operator.
Setelah transaksi pengisian BBM selesai, data distribusi secara otomatis direkam ke dalam
Blockchain sebagai immutable audit trail. Setiap transaksi tersimpan secara aman dan sulit
dimodifikasi sehingga riwayat distribusi dapat ditelusuri kembali ketika diperlukan untuk
proses pengawasan maupun audit. Mekanisme ini berfungsi sebagai lapisan tambahan yang
memperkuat integritas data tanpa menggantikan basis data utama MyPertamina. Selain
mendukung pengawasan, PETROCHAIN juga menyediakan informasi ketersediaan BBM
secara real-time. Administrator SPBU dapat memperbarui status stok melalui dashboard,
kemudian informasi tersebut langsung ditampilkan pada aplikasi pengguna. Fitur ini
membantu masyarakat mengetahui kondisi stok sebelum menuju SPBU sehingga dapat
mengurangi potensi blind queuing.
Secara keseluruhan, mekanisme kerja PETROCHAIN menunjukkan bahwa setiap fitur
dikembangkan untuk saling melengkapi dalam mendukung distribusi BBM bersubsidi.
Integrasi OCR, YOLO, dan Blockchain memungkinkan proses verifikasi, validasi,
pengawasan, serta penyampaian informasi dilakukan secara lebih terintegrasi sehingga
mampu memperkuat ekosistem MyPertamina tanpa mengubah mekanisme distribusi yang
telah diterapkan pemerintah.

---

28
2.5 Uraian Peran & Kontribusi Pihak yang Terlibat dalam PETROCHAIN
Implementasi PETROCHAIN melibatkan beberapa pemangku kepentingan yang saling
terintegrasi dalam mendukung tata kelola distribusi BBM bersubsidi. Pembagian peran
tersebut disajikan pada Tabel 2.2.
Tabel 2.2 Peran Pihak - Pihak Yang Terkait
No Pihak Terkait Hubungan Peran
1 Masyarakat G2C Mengajukan registrasi subsidi,
menggunakan QR Code, serta
melihat informasi stok BBM
2 Administrator Pertamina G2B Memverifikasi hasil OCR pada
proses registrasi serta mengelola
data pengguna subsidi
3 Operator Pertamina G2B 
Melakukan proses pengisian
BBM, menjalankan validasi QR
Code dengan nomor polisi
kendaraan, dan memperbarui
informasi stok BBM
4 BPH Migas G2G Melakukan pengawasan
distribusi dan mengakses riwayat
transaksi berbasis Blockchain
5 Kementerian ESDM G2G Memanfaatkan data distribusi
sebagai bahan evaluasi kebijakan
energi nasional
6 Kementerian Keuangan RI G2G Memantau efektivitas penyaluran
subsidi sebagai dasar evaluasi
penggunaan anggaran negara
Apabila PETROCHAIN diimplementasikan, keberhasilan sistem tidak hanya
bergantung pada teknologi yang digunakan, tetapi juga pada kontribusi dari setiap pemangku
kepentingan yang terlibat. Setiap pihak memiliki kontribusi yang berbeda sesuai dengan
kewenangan dan tanggung jawabnya dalam mendukung distribusi BBM bersubsidi yang lebih
tepat sasaran, transparan, dan akuntabel. Rincian kontribusi masing-masing pemangku
kepentingan disajikan pada Tabel 2.3.

---

29
Tabel 2.3 Kontribusi Pihak-pihak yang Terkait
No Pihak Terkait Kontribusi
1 Masyarakat Berpartisipasi dengan melakukan registrasi
kendaraan secara benar, menggunakan QR Code
sesuai ketentuan, serta memanfaatkan informasi
stok BBM sehingga mendukung distribusi
subsidi yang lebih tepat sasaran
2 Administrator Pertamina Mendukung kualitas data penerima subsidi
melalui proses verifikasi hasil OCR dan
pengelolaan data pengguna sehingga validitas
data tetap terjaga
3 Operator Pertamina Mendukung pelaksanaan distribusi BBM
bersubsidi melalui validasi kendaraan,
pengoperasian sistem PETROCHAIN, serta
pembaruan informasi stok BBM secara berkala
4 BPH Migas 
Memanfaatkan data transaksi berbasis
Blockchain sebagai sarana pengawasan dan
audit sehingga proses distribusi dapat dipantau
secara lebih transparan dan akuntabel
5 Kementerian ESDM 
Memanfaatkan data distribusi sebagai bahan
evaluasi kebijakan dan penyempurnaan regulasi
penyaluran BBM bersubsidi
6 Kementerian Keuangan RI Memanfaatkan data distribusi untuk
mengevaluasi efektivitas penggunaan anggaran
subsidi sebagai dasar penyusunan kebijakan
fiskal yang lebih efisien
Berdasarkan Tabel 2.3, implementasi PETROCHAIN mendorong kolaborasi antara
masyarakat, PT Pertamina Patra Niaga, operator SPBU, BPH Migas, Kementerian ESDM,
dan Kementerian Keuangan RI dalam mendukung tata kelola distribusi BBM bersubsidi.
Kontribusi masing-masing pihak saling melengkapi, mulai dari penyediaan data yang valid,
pelaksanaan verifikasi dan distribusi di lapangan, hingga pengawasan serta evaluasi
kebijakan. Kolaborasi tersebut diharapkan dapat meningkatkan ketepatan sasaran subsidi,
memperkuat transparansi distribusi, dan mendukung pengambilan keputusan berbasis data.
2.6 Keunggulan Inovasi pada PETROCHAIN
PETROCHAIN dikembangkan dengan pendekatan system enhancement, yaitu
memperkuat sistem distribusi BBM bersubsidi yang telah diterapkan pemerintah tanpa
mengubah regulasi maupun alur distribusi yang berlaku. Pendekatan ini memungkinkan
implementasi dilakukan secara lebih realistis karena memanfaatkan infrastruktur yang telah

---

30
tersedia. Dibandingkan dengan mekanisme distribusi saat ini, PETROCHAIN menawarkan
beberapa keunggulan utama yang dirangkum pada Tabel 2.4.
Tabel 2.4 Keunggulan utama PETROCHAIN
No Aspek MyPertamina PETROCHAIN
1 Registrasi Subsidi Pemeriksaan
dokumen dilakukan
secara manual
OCR membantu proses verifikasi
dokumen sehingga administrator
hanya melakukan validasi akhir
2 Validasi Pengisian Berdasarkan QR
Code
QR Code diperkuat dengan
validasi nomor polisi
menggunakan YOLO-OCR
3 Audit Transaksi Basis data terpusat Blockchain menghasilkan
immutable audit trail
4 Informasi Stok
BBM
Lokasi SPBU dan
jenis BBM
Ditambah status stok
“Tersedia/Habis” yang
diperbarui oleh admin SPBU
5 Posisi Inovasi Sistem Utama Platform pendukung (Extension)
MyPertamina
6 Validasi
Kendaraan Roda
Dua
Belum terdapat
identifikasi kategori
kapasitas mesin
YOLO mengklasifikasikan motor
under 250 cc dan over 250 cc
sebagai validasi tambahan
penerima subsidi
2.7 Tahapan-Tahapan Strategis Penerapan PETROCHAIN
Rencana implementasi PETROCHAIN disusun melalui peta jalan (roadmap) yang
sistematis sebagai acuan dalam pengembangan dan penerapan sistem secara bertahap.
Penyusunan tahapan tersebut bertujuan untuk memastikan setiap proses, mulai dari
identifikasi permasalahan hingga implementasi di lapangan, dapat dilakukan secara terstruktur
serta melibatkan pemangku kepentingan yang relevan. Dengan pendekatan ini,
PETROCHAIN diharapkan dapat diimplementasikan tanpa mengganggu mekanisme
distribusi BBM bersubsidi yang telah berjalan, karena sistem berperan sebagai platform
pendukung yang terintegrasi dengan infrastruktur yang sudah ada.

---

31
Gambar 2.31 Alur Tahapan Implementasi PETROCHAIN
Sebagaimana ditunjukkan pada Gambar 2.31, rencana implementasi PETROCHAIN
mengadopsi pendekatan Rapid Prototyping agar pengembangan sistem dapat dilakukan secara
bertahap, adaptif, dan sesuai dengan kebutuhan pengguna. Tahapan diawali dengan proses
komunikasi (communication) melalui studi literatur, observasi, dan wawancara dengan pihak
terkait untuk mengidentifikasi kebutuhan sistem. Hasil tersebut kemudian menjadi dasar
dalam penyusunan kebutuhan fungsional dan nonfungsional (quick plan), yang dilanjutkan
dengan perancangan arsitektur sistem (quick design) meliputi antarmuka, basis data, serta
integrasi teknologi OCR, YOLO, QR Code, dan blockchain. Setelah rancangan disusun,
proses berlanjut pada pembangunan prototipe (construction) yang mengintegrasikan seluruh
komponen sistem untuk menghasilkan aplikasi yang siap dievaluasi.
Tahap berikutnya adalah evaluasi prototipe (user evaluation) melalui pengujian
bersama calon pengguna dan pemangku kepentingan. Masukan yang diperoleh menjadi dasar
untuk menentukan apakah sistem telah memenuhi kebutuhan pengguna atau perlu dilakukan
penyempurnaan pada tahap sebelumnya. Mekanisme ini memungkinkan proses
pengembangan berlangsung secara iteratif sehingga kualitas sistem dapat terus ditingkatkan
sebelum memasuki tahap implementasi.
Apabila prototipe telah dinyatakan sesuai, proses dilanjutkan dengan pelatihan operator
SPBU dan sosialisasi kepada pengguna sebagai bentuk persiapan implementasi di lapangan.
Selanjutnya, PETROCHAIN diterapkan secara bertahap pada SPBU sebagai lokasi
implementasi awal sebelum diperluas ke wilayah lain sesuai hasil evaluasi. Setelah sistem
digunakan, dilakukan monitoring dan pemeliharaan secara berkala untuk memastikan seluruh
fitur tetap berjalan optimal, sekaligus memberikan ruang bagi pengembangan dan
penyempurnaan sistem sesuai kebutuhan di masa mendatang.

---

32
### BAB III
KESIMPULAN
PETROCHAIN merupakan gagasan platform e-Government pendukung (extension
platform) yang dirancang untuk memperkuat ekosistem MyPertamina dalam meningkatkan
ketepatan sasaran, transparansi, dan efektivitas distribusi BBM bersubsidi di Indonesia.
Gagasan ini hadir sebagai solusi atas berbagai permasalahan yang masih ditemukan pada
mekanisme penyaluran subsidi, seperti potensi penyalahgunaan identitas kendaraan,
keterbatasan proses verifikasi, kurangnya transparansi riwayat transaksi, serta minimnya
informasi ketersediaan BBM yang dapat diakses masyarakat. Berbeda dengan pengembangan
sistem baru, PETROCHAIN dirancang untuk terintegrasi dengan mekanisme yang telah
berjalan sehingga implementasinya tidak mengubah alur distribusi BBM bersubsidi yang saat
ini diterapkan oleh pemerintah.
Penguatan sistem diwujudkan melalui integrasi beberapa teknologi, yaitu Optical
Character Recognition (OCR) untuk memverifikasi kesesuaian data kendaraan pada tahap
registrasi, You Only Look Once (YOLO) dan OCR untuk memvalidasi identitas kendaraan
saat proses pengisian BBM, Blockchain untuk menghasilkan riwayat transaksi yang
transparan dan sulit dimanipulasi, serta fitur informasi ketersediaan BBM yang membantu
masyarakat memperoleh informasi stok sebelum menuju SPBU. Integrasi berbagai teknologi
tersebut diharapkan mampu meningkatkan keamanan proses distribusi, meminimalkan
potensi penyalahgunaan subsidi, sekaligus mendukung proses pengawasan yang lebih efektif
bagi Pertamina maupun pemerintah.
Sebagai sebuah gagasan inovatif, PETROCHAIN memiliki potensi untuk
diimplementasikan secara bertahap melalui proses pengembangan sistem, pengujian, pilot
project pada SPBU percontohan, hingga implementasi yang lebih luas setelah melalui tahap
evaluasi dan penyempurnaan. Dengan pendekatan tersebut, PETROCHAIN diharapkan dapat
menjadi salah satu alternatif inovasi digital yang mendukung terciptanya tata kelola distribusi
BBM bersubsidi yang lebih akuntabel, efisien, dan tepat sasaran. Selain memberikan manfaat
bagi pemerintah, Pertamina, dan operator SPBU dalam aspek pengawasan serta pengelolaan
distribusi, implementasi PETROCHAIN juga diharapkan mampu meningkatkan kualitas
pelayanan kepada masyarakat melalui proses penyaluran subsidi yang lebih transparan, mudah
diakses, dan berkeadilan.

---

33
### DAFTAR PUSTAKA
Adelia Gusfira, Hasanatun Fitri dan Ahmad Wahyudi Zein (2025) “Dampak Subsidi Energi
terhadap Kesejahteraan Masyarakat Miskin di Indonesia,” Jurnal Ilmu Komunikasi,
Administrasi Publik dan Kebijakan Negara, 2(3), hal. 13–22. doi:
10.62383/komunikasi.v2i3.295.
Alharbi, F. et al. (2023) “YOLO and Blockchain Technology Applied to Intelligent
Transportation License Plate Character Recognition for Security,” Computers,
Materials and Continua, 77(3), hal. 3697–3722. doi: 10.32604/cmc.2023.040086.
Amirullah (2025) Daftar Kendaraan Dilarang dan Boleh Isi Pertalite per September 2025,
Ini Dampak pada Pertamina, Pertamina, Serambinews.com. Tersedia pada:
https://aceh.tribunnews.com/news/986316/daftar-kendaraan-dilarang-dan-boleh-isi-
pertalite-per-september-2025-ini-dampak-pada-pertamina (Diakses: 29 Juni 2026).
Ayu Suraya, Salsabila Zahira Putri dan Nurul Kamaly (2025) “Efektivitas Penggunaan
MyPertamina Dalam Penyaluran BBM Bersubsidi Pada Masyarakat Aceh,” Journal
of Governance and Public Administration, 2(3), hal. 619–632. doi:
10.70248/jogapa.v2i3.2155.
BPH Migas (2023) Pantau SPBU di Aceh, BPH Migas Temukan Indikasi Penyalahgunaan
Distribusi BBM Subsidi, BPH Migas. Tersedia pada:
https://www.bphmigas.go.id/pantau-spbu-di-aceh-bph-migas-temukan-indikasi-
penyalahgunaan-distribusi-bbm-subsidi/ (Diakses: 5 Mei 2026).
Chantika, E., Gustini, G. dan Charolina, O. (2024) “Pengaruh Pelaksanaan Qr Barcode My
Pertamina Terhadap Penjualan BBM,” Jurnal Administrasi Bisnis Nusantara, 3(1),
hal. 35–46. doi: 10.56135/jabnus.v3i1.145.
Desk, E. (2025) Sebagian Besar BBM Bersubsidi Salah Sasaran, Next Indonesia. Tersedia
pada: https://nextindonesia.id/Update/2025/08/15/157/Sebagian-Besar-BBM-
Bersubsidi-Salah-Sasaran (Diakses: 29 Juni 2026).
Haryani, I. et al. (2025) “Blockchain-based renewable energy certificate system in Indonesia,”
Heliyon. Elsevier Ltd, 11(3), hal. e42364. doi: 10.1016/j.heliyon.2025.e42364.
He, Y. (2024) “Automatic Detection of Electric Motorcycle Based on Improved YOLOv5s
Network,” Journal of Electrical and Computer Engineering, 2024. doi:
10.1155/2024/4889707.
Ibrahim, R. (2018) “Sharing delay information in service systems: a literature survey,”
Queueing Systems. Springer US, 89(1–2), hal. 49–79. doi: 10.1007/s11134-018-9577-
y.
Kaniza, S. (2026) Panduan Lengkap Daftar QR Code Pertamina 2026: Cara Buat Barcode
Subsidi Tepat Agar Lolos di SPBU, Simade Blog. Tersedia pada:
https://www.simade.co.id/panduan-lengkap-daftar-qr-code-pertamina-2026-cara-
buat-barcode-subsidi-tepat-agar-lolos-di-spbu (Diakses: 1 Juli 2026).
Kementerian Keuangan RI (2026) Kerangka Ekonomi Makro dan Pokok-Pokok Kebijakan
Fiskal 2026 (Pemutakhiran): Kedaulatan Pangan, Energi, dan Ekonomi.
Kristianus, A. (2022) Menkeu: Subsidi BBM Lebih Banyak Dinikmati Masyarakat Mampu,
BeritaSatu. Tersedia pada: https://www.beritasatu.com/ekonomi/969367/menkeu-
subsidi-bbm-lebih-banyak-dinikmati-masyarakat-mampu (Diakses: 14 Mei 2026).
Manaraja, A. dan Rizal, K. (2025) “Analisis Kinerja Aplikasi MyPertamina Dengan
Menggunakan Pendekatan Pengujian Performa Dan Kepuasan Pengguna Dengan
Metode Pieces,” JISAMAR (Journal of Information System, Applied, Management,
Accounting and Research), 9(4), hal. 1439–1451. doi: 10.52362/jisamar.v9i4.2096.

---

34
Mulyana, D. I. dan Rofik, M. A. (2022) “Implementasi Deteksi Real Time Klasifikasi Jenis
Kendaraan Di Indonesia Menggunakan Metode YOLOV5,” Jurnal Pendidikan
Tambusai, 6(3), hal. 13971–13982. doi: 10.31004/jptam.v6i3.4825.
Nugroho, H. S. (2025) “Blockchain Implementation on Subsidised LPG Distribution in Gas
Supply Chain (Case Study: Medan),” Data Science: Journal of Computing and
Applied Informatics, 9(2), hal. 1–17. doi: 10.32734/jocai.v9.i2-16624.
Prasetio, D. E. (2026) Kebijakan Hukum Pembatasan BBM di Tengah Krisis Energi: Apa dan
Bagaimana?, Suara Desa. Tersedia pada: https://suaradesa.co/opini/kebijakan-
hukum-pembatasan-bbm-di-tengah-krisis-energi-apa-dan-bagaimana/ (Diakses: 4 Juli
2026).
Putra, D. C. dan Irawati, A. C. (2025) “Analisis Yuridis Penerapan Barcode My Pertamina
Dalam Pembelian BBM Bersubsidi Di Kabupaten Semarang,” Journal of Innovative
and Creativity, 5(2), hal. 13628–13632.
Royani, F., Aprianto, S. dan Majesti, V. (2026) “Perlindungan Hukum Terhadap Korban
Penyalahgunaan Kepemilikan Barcode Mypertamina Dalam Distribusi Bahan Bakar
Minyak (BBM) Bersubsidi,” Jurnal Hukum Sehasen, 12(1), hal. 189–196.
Sa’diyah, S. S. et al. (2025) “Kebijakan Subsidi BBM,” Jurnal Ilmiah Ekonomi, 1(2), hal.
450–458.
Shashirangana, J. et al. (2021) “Automated license plate recognition: A survey on methods
and techniques,” IEEE Access, 9, hal. 11203–11225. doi:
10.1109/ACCESS.2020.3047929.
Sihombing, J. C. (2022) Kenaikan Harga BBM : Jahat atau Sepakat..???, Kementerian
Keuangan. Tersedia pada: https://www.djkn.kemenkeu.go.id/kpknl-sidempuan/baca-
artikel/15373/Kenaikan-Harga-BBM-Jahat-atau-Sepakat.html (Diakses: 29 Juni
2026).
Soesanto, E., Komansilan, T. dan Salsabillah, N. (2025) “Dinamika Harga BBM: Dampaknya
Terhadap Ekonomi Nasional dan Daya Beli Masyarakat,” Jupiter: Publikasi Ilmu
Keteknikan Industri, Teknik Elektro dan Informatika, 3(1), hal. 165–174. doi:
10.61132/jupiter.v3i1.686.
Sunarta, S. et al. (2025) “Implementasi dan Pengembangan Sistem Pengenalan Plat Nomor
Kendaraan Secara Otomatis Menggunakan Yolo v5 dan Google Vision OCR,” JIIP -
Jurnal Ilmiah Ilmu Pendidikan, 8(7), hal. 7745–7753. doi: 10.54371/jiip.v8i7.8746.
Triwibowo, R. D. dan Pramono, S. (2025) “Kajian Implementasi Pengawasan Subsidi Bahan
Bakar Minyak (BBM) di Indonesia: Perspektif Teori Daniel A. Mazmanian dan Paul
A. Sabatier,” Jurnal Nasional Pengelolaan Energi MigasZoom, 7(1), hal. 61–72.
Wijaya, H. et al. (2025) “Observasi Penggunaan Aplikasi MyPertamina di SPBU Cangkring
Karanganyat Demak,” JUTIRA (Jurnal Bakti Nusantara), 3(1), hal. 19–29.

---

35
### LAMPIRAN
Lampiran 1. Surat Pernyataan