# 🎧 Audio Verse - Music Discovery Web App

![Audio Verse Preview](https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop)

**Audio Verse** adalah aplikasi *Music Discovery* berbasis web yang dirancang dengan antarmuka UI/UX modern ala Spotify/Apple Music. Dibangun murni menggunakan **Vanilla JavaScript**, aplikasi ini berfokus pada kecepatan, aksesibilitas, dan pengalaman pengguna (User Experience) yang mulus.

🔗 **[Coba Audio Verse Secara Live Di Sini!](https://audio-verses.netlify.app/)**

---

## ✨ Fitur Unggulan (Core Features)

*   📻 **Infinite Radio (AI Discovery):** Algoritma pintar yang mengekstrak genre dari lagu terakhir yang diputar, lalu otomatis mencari dan memutar lagu dengan genre serupa dari iTunes API.
*   🎛️ **Custom Global Music Player:** Pemutar musik *sticky* di dasar layar yang dilengkapi fitur *Drag Timeline*, *Shuffle*, *Repeat*, dan *Volume Slider* yang sinkron dengan *State* aplikasi.
*   📱 **Progressive Web App (PWA):** Mendukung instalasi langsung ke *Home Screen* (Android/iOS) lengkap dengan *Service Worker* dan *Web App Manifest*.
*   🔒 **Lockscreen Control:** Terintegrasi dengan `Media Session API`, memungkinkan pengguna mengontrol musik (Play/Pause/Next) langsung dari layar kunci HP atau *headset bluetooth*.
*   ⌨️ **Keyboard Accessibility:** Mendukung navigasi menggunakan *Keyboard* (Spasi untuk Play/Pause, Panah Kiri/Kanan untuk Skip 5 Detik, dan 'M' untuk Mute).
*   💾 **State Management:** Menggunakan `localStorage` untuk menyimpan riwayat pencarian (dibatasi 5 entri tanpa duplikat) dan daftar lagu favorit.
*   📱 **Responsive Mobile-First UI:** Menggunakan CSS Grid & Flexbox, dilengkapi dengan *Off-canvas Mini Sidebar* dan *Smart Sticky Navbar* yang bersembunyi saat di-scroll.

---

## 🛠️ Teknologi yang Digunakan (Tech Stack)

*   **HTML5** (Semantic Elements)
*   **CSS3** (CSS Grid, Flexbox, Glassmorphism, Keyframe Animations)
*   **Vanilla JavaScript** (ES6+, Async/Await, DOM Manipulation)
*   **API:** Apple iTunes Search API

---

## 🧠 Tantangan Teknis & Solusi (Problem Solving)

1.  **Keterbatasan API iTunes (Tidak Ada Pagination):** Mengatasi hal ini dengan meminta data dalam jumlah besar sekaligus (`limit=60`), lalu membuat sistem *Client-Side Pagination* menggunakan array `.slice()`.
2.  **Tabrakan Audio (Audio Overlap):** Menghapus penggunaan `<audio>` ganda pada setiap lagu dan memusatkan sumber suara pada satu *Global Player* untuk mencegah suara tumpang tindih.
3.  **Cross-fade Ghosting pada Animasi GIF:** Menghitung ulang rumus `@keyframes` secara matematis agar transisi antar gambar GIF di *Hero Banner* terjadi dengan mulus tanpa ada tumpukan *frame*.

---
*Didesain dan dikembangkan dengan ❤️ sebagai proyek portfolio.*