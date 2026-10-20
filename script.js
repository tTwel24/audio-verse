console.log("Audio Verse Berhasil Terhubung!");

// ==========================================
// 1. UTILITAS TOAST
// ==========================================
let toastTimer;
function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer); 
    toastTimer = setTimeout(() => { toast.classList.remove("show"); }, 3000); 
}

// ==========================================
// 2. DEKLARASI VARIABEL DOM (HTML)
// ==========================================
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const resultsList = document.getElementById("results-list");
const recentContainer = document.getElementById("recent-searches-container");
const heroPlayBtn = document.getElementById("hero-play-btn");
const favoriteList = document.getElementById("favorites-list");

const menuToggleBtn = document.getElementById("menu-toggle-btn");
const sidebar = document.querySelector(".sidebar");

const userAvatar = document.getElementById("user-avatar");
const profileDropdown = document.getElementById("profile-dropdown");
const bellIcon = document.getElementById("bell-icon");
const notifDropdown = document.getElementById("notif-dropdown");
const notifBadge = document.getElementById("notif-badge");
const backToHomeBtn = document.getElementById("back-to-home-btn");
const topNav = document.querySelector(".top-nav");
const mainContentArea = document.querySelector(".main-content");

const navHome = document.getElementById("nav-home");
const heroBanner = document.getElementById("hero-banner");
const moodSection = document.getElementById("mood-section");
const resultSection = document.getElementById("result-section");
const favoritesSection = document.getElementById("favorites-section");
const moodToFavBtn = document.getElementById("mood-to-fav");

const modalOverlay = document.getElementById("confirm-modal");
const modalCancelBtn = document.getElementById("modal-cancel-btn");
const modalConfirmBtn = document.getElementById("modal-confirm-btn");
const clearFavoritesButton = document.getElementById("clear-favorites-button");

const globalAudio = document.getElementById("main-audio");
const playerTitle = document.getElementById("player-title");
const playerArtist = document.getElementById("player-artist");
const playerImg = document.getElementById("player-img");
const playerFavBtn = document.getElementById("player-fav-btn"); 
const mainPlayBtn = document.getElementById("main-play-btn");
const prevBtn = document.getElementById("prev-btn"); 
const nextBtn = document.getElementById("next-btn"); 
const shuffleBtn = document.getElementById("shuffle-btn");
const repeatBtn = document.getElementById("repeat-btn");
const progressBar = document.getElementById("progress-bar");
const progressContainer = document.getElementById("progress-container");
const currentTimeEl = document.getElementById("current-time");
const totalDurationEl = document.getElementById("total-duration");
const volumeBtn = document.getElementById("volume-btn");
const volumeSlider = document.getElementById("volume-slider");
const navExplore = document.getElementById("nav-explore");
const navLibrary = document.getElementById("nav-library");

// ==========================================
// 3. STATE MANAGEMENT (MEMORI)
// ==========================================
let favorites = JSON.parse(localStorage.getItem("myFavorites")) || [];
let recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
let currentPlaylist = []; 
let currentSongIndex = 0; 
let isAutoRadioMode = false; 
let isShuffle = false;
let isRepeat = false;

tampilkanSemuaFavorit();
tampilkanRiwayat();

// ==========================================
// 4. TAB NAVIGATION (SINGLE PAGE APP)
// ==========================================
function openHomeTab() {
    heroBanner.classList.remove("d-none");
    moodSection.classList.remove("d-none");
    resultSection.classList.remove("d-none");
    favoritesSection.classList.add("d-none");

    navHome.classList.add("active");
    if(navLibrary) navLibrary.classList.remove("active");
}

function openLibraryTab() {
    heroBanner.classList.add("d-none");
    moodSection.classList.add("d-none");
    resultSection.classList.add("d-none");
    favoritesSection.classList.remove("d-none");

    if(navLibrary) navLibrary.classList.add("active");
    navHome.classList.remove("active");
    
    tampilkanSemuaFavorit();
}

navHome.addEventListener("click", openHomeTab);
backToHomeBtn.addEventListener("click", openHomeTab);
if(navLibrary) navLibrary.addEventListener("click", openLibraryTab);
moodToFavBtn.addEventListener("click", openLibraryTab); 

if(navExplore) navExplore.addEventListener("click", () => showToast("🚀 Fitur Explore akan segera hadir!"));

//4.1 Hamburger Menu Toggle (untuk versi mobile)
menuToggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
});

// ==========================================
// 5. LOGIKA PENCARIAN & CETAK KARTU
// ==========================================
async function fetchSearchResults(query) {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=10`;
    
    resultsList.innerHTML = `<div class="status-state"><div class="music-wave"><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div></div><p>Menyelaraskan frekuensi audio...</p></div>`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        displayResults(data.results);
    } catch (error) {
        resultsList.innerHTML = `<div class="status-state"><i class="fas fa-exclamation-triangle" style="color: #e91429;"></i><p>Terjadi kesalahan koneksi.</p></div>`;
    }
}

function displayResults(songs) {
    resultsList.innerHTML = "";
    currentPlaylist = songs; 

    if (songs.length === 0) {
        resultsList.innerHTML = `<div class="status-state"><i class="fas fa-search-minus"></i><p>Waduh, audionya nggak ketemu nih.</p></div>`;
        return;
    }

    songs.forEach((song, index) => {
        const card = document.createElement("div");
        card.classList.add("song-card");
        const highResImage = song.artworkUrl100.replace("100x100bb.jpg", "300x300bb.jpg");
        const isFav = favorites.some((favSong) => favSong.trackId === song.trackId);
        const heartIcon = isFav ? '<i class="fas fa-heart" style="color: #ff3b3b;"></i>' : '<i class="far fa-heart"></i>';

        let playOverlayHTML = song.previewUrl 
            ? `<div class="play-overlay playable"><div class="play-circle"><i class="fas fa-play"></i></div></div>` 
            : `<div class="play-overlay"><i class="fas fa-ban" style="font-size:20px;"></i></div>`;

        card.innerHTML = `
            <div class="cover-container">
                <img src="${highResImage}" alt="${song.trackName}" class="album-cover">
                ${playOverlayHTML}
                <button class="heart-btn" title="Favorit">${heartIcon}</button>
            </div>
            <div class="song-info">
                <strong>${song.trackName || song.collectionName}</strong><br>
                <p>${song.artistName}</p>
            </div>`;
        
        if (song.previewUrl) {
            card.querySelector(".play-overlay").addEventListener("click", () => {
                playSong(index); 
            });
        }

        const heartBtn = card.querySelector(".heart-btn");
        heartBtn.addEventListener("click", () => toggleFavorite(song, heartBtn));
        resultsList.appendChild(card);
    });

    if (isAutoRadioMode && songs.length > 0) {
        const firstPlayBtn = resultsList.querySelector(".play-overlay.playable");
        if (firstPlayBtn) {
            setTimeout(() => { firstPlayBtn.click(); showToast("🎵 Radio otomatis dimulai!"); }, 1000); 
        }
        isAutoRadioMode = false; 
    }
}

// ==========================================
// 6. FUNGSI DAFTAR FAVORIT
// ==========================================
function tampilkanSemuaFavorit() {
    favoriteList.innerHTML = ""; 

    if (favorites.length === 0) {
        favoriteList.innerHTML = `<div class="status-state"><i class="fas fa-heart-broken"></i><p>Belum ada lagu favorit nih.<br>Cari lagu dan klik ikon hati ya!</p></div>`;
        return;
    }

    favorites.forEach((song, index) => {
        const cardFav = document.createElement("div");
        cardFav.classList.add("song-card");
        const highResImage = song.artworkUrl100.replace("100x100bb.jpg", "300x300bb.jpg");
        let playOverlayHTML = song.previewUrl ? `<div class="play-overlay playable"><div class="play-circle"><i class="fas fa-play"></i></div></div>` : `<div class="play-overlay"><i class="fas fa-ban" style="font-size:20px;"></i></div>`;
        
        cardFav.innerHTML = `
            <div class="cover-container">
                <img src="${highResImage}" alt="${song.trackName}" class="album-cover">
                ${playOverlayHTML} 
                <button class="heart-btn" title="Hapus Favorit"><i class="fas fa-heart" style="color: #ff3b3b;"></i></button>
            </div>
            <div class="song-info">
                <strong>${song.trackName || song.collectionName}</strong><br>
                <p>${song.artistName}</p>
            </div>`;

        if (song.previewUrl) {
            cardFav.querySelector(".play-overlay").addEventListener("click", () => {
                currentPlaylist = favorites; 
                playSong(index);
            });
        }

        cardFav.querySelector(".heart-btn").addEventListener("click", () => toggleFavorite(song, null));
        favoriteList.appendChild(cardFav);
    });
}

function toggleFavorite(song, heartBtnElement) {
    const indexFav = favorites.findIndex((favSong) => favSong.trackId === song.trackId);
    if (indexFav === -1) {
        favorites.push(song);
        if(heartBtnElement) heartBtnElement.innerHTML = '<i class="fas fa-heart" style="color: #ff3b3b;"></i>';
        showToast(`✅ Ditambahkan ke favorit!`);
    } else {
        favorites.splice(indexFav, 1);
        if(heartBtnElement) heartBtnElement.innerHTML = '<i class="far fa-heart"></i>';
        showToast(`🗑️ Dihapus dari favorit!`);
    }
    localStorage.setItem("myFavorites", JSON.stringify(favorites));
    tampilkanSemuaFavorit();
    updatePlayerHeart(song); 
}

// ==========================================
// 7. RIWAYAT PENCARIAN
// ==========================================
function tampilkanRiwayat() {
    recentContainer.innerHTML = "";
    recentSearches.forEach((keyword) => {
        const cardRecent = document.createElement("button");
        cardRecent.className = "recent-chip";
        cardRecent.innerHTML = `<i class="fas fa-history"></i> ${keyword}`;
        cardRecent.addEventListener("click", () => {
            searchInput.value = keyword;
            recentContainer.classList.remove("show"); 
            searchButton.click();
        });
        recentContainer.appendChild(cardRecent);
    });
}

searchInput.addEventListener("focus", () => { if (recentSearches.length > 0) recentContainer.classList.add("show"); });
document.addEventListener("click", (event) => {
    // 1. Sembunyikan Riwayat Pencarian
    if (!searchInput.contains(event.target) && !recentContainer.contains(event.target)) {
        recentContainer.classList.remove("show"); 
    }
    // 2. Sembunyikan Dropdown Profil
    if (!userAvatar.contains(event.target) && !profileDropdown.contains(event.target)) {
        profileDropdown.classList.remove("show");
    }
    if (bellIcon && notifDropdown && !bellIcon.contains(event.target) && !notifDropdown.contains(event.target)) {
        notifDropdown.classList.remove("show");
    }

});

// EVENT TOMBOL SEARCH (PANGGIL FUNGSI TAB HOME JUGA!)
searchButton.addEventListener("click", () => {
    openHomeTab(); // 👈 BUKA TAB HOME OTOMATIS SAAT NYARI LAGU
    
    const query = searchInput.value.trim();
    if (query) { 
        const existingIndex = recentSearches.indexOf(query);
        if (existingIndex !== -1) { recentSearches.splice(existingIndex, 1); }
        recentSearches.unshift(query);
        if (recentSearches.length > 5) { recentSearches.pop(); }
        localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
        tampilkanRiwayat(); 
        recentContainer.classList.remove("show"); 
        fetchSearchResults(query);
    } else {
        showToast("🔍 Masukkan kata kunci!");
    }
});

searchInput.addEventListener("keypress", (event) => { if (event.key === "Enter") searchButton.click(); });

// ==========================================
// 8. MOOD EXPLORER (HACK API ITUNES)
// ==========================================
const moodCards = document.querySelectorAll(".mood-card");

if (heroPlayBtn) {
    heroPlayBtn.addEventListener("click", () => {
        const editorPlaylists = ["Powfu", "Payung Teduh", "Sleepy Fish", "Anri (杏里)", "slipfunc", "Diskoria", "Danilla", "White Soes & The Couples Company"];
        const randomIndex = Math.floor(Math.random() * editorPlaylists.length);
        const selectedKeyword = editorPlaylists[randomIndex];
        searchInput.value = selectedKeyword;
        isAutoRadioMode = true; 
        searchButton.click();
        showToast(`🎵 Memutar Vibe Pilihan: ${selectedKeyword.toUpperCase()}!`);
    });
}

moodCards.forEach((card) => {
    card.addEventListener("click", () => {
        const rawKeyword = card.getAttribute("data-keyword");
        if (rawKeyword) {
            const keywordsArray = rawKeyword.split(",");
            const randomIndex = Math.floor(Math.random() * keywordsArray.length);
            const selectedKeyword = keywordsArray[randomIndex].trim();

            searchInput.value = selectedKeyword;
            isAutoRadioMode = true;
            searchButton.click();
            document.getElementById("result-section").scrollIntoView({ behavior: 'smooth' });
            showToast(`🎵 Memutar Vibe: ${selectedKeyword.toUpperCase()}!`);
        }
    });
});

// ==========================================
// 9. MODAL KONFIRMASI HAPUS
// ==========================================
clearFavoritesButton.addEventListener("click", () => {
    if (favorites.length === 0) { showToast("⚠️ Daftar favorit kosong!"); return; }
    modalOverlay.classList.add("show");
});
modalCancelBtn.addEventListener("click", () => modalOverlay.classList.remove("show"));
modalConfirmBtn.addEventListener("click", () => {
    favorites = [];
    localStorage.setItem("myFavorites", JSON.stringify(favorites));
    tampilkanSemuaFavorit();
    modalOverlay.classList.remove("show");
    showToast("🗑️ Favorit dikosongkan!");
});

// ==========================================
// 10. KENDALI PEMUTAR MUSIK GLOBAL (SUPER PRO)
// ==========================================
function playSong(index) {
    if (currentPlaylist.length === 0) return;
    currentSongIndex = index;
    const song = currentPlaylist[currentSongIndex];
    const highResImage = song.artworkUrl100.replace("100x100bb.jpg", "300x300bb.jpg");

    playerTitle.textContent = song.trackName || song.collectionName;
    playerArtist.textContent = song.artistName;
    playerImg.src = highResImage;
    globalAudio.src = song.previewUrl;
    globalAudio.play(); 
    updatePlayerHeart(song);
}

    if(`mediaSession` in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: song.trackName || song.collectionName,
            artist: song.artistName,
            album: `Audio Verse`,
            artwork: [
                { src: highResImage, sizes: `300x300`, type: `image/jpeg` }
            ]
        });

        navigator.mediaSession.setActionHandler(`play`, () => {
            globalAudio.play(); });
        navigator.mediaSession.setActionHandler(`pause`, () => {
            globalAudio.pause(); });
        navigator.mediaSession.setActionHandler(`previoustrack`, () => {
            prevBtn.click(); }):
        navigator.mediaSession.setActionHandler(`nexttrack`, () => {
            nextBtn.click(); });
}
    

nextBtn.addEventListener("click", () => {
    let nextIndex = isShuffle ? Math.floor(Math.random() * currentPlaylist.length) : currentSongIndex + 1;
    if (nextIndex >= currentPlaylist.length) nextIndex = 0; 
    playSong(nextIndex);
});

prevBtn.addEventListener("click", () => {
    let prevIndex = currentSongIndex - 1;
    if (prevIndex < 0) prevIndex = currentPlaylist.length - 1; 
    playSong(prevIndex);
});

function updatePlayerHeart(song) {
    const isFav = favorites.some((f) => f.trackId === song.trackId);
    playerFavBtn.innerHTML = isFav ? '<i class="fas fa-heart" style="color: #ff3b3b;"></i>' : '<i class="far fa-heart"></i>';
}
playerFavBtn.addEventListener("click", () => {
    if (currentPlaylist.length === 0) return;
    toggleFavorite(currentPlaylist[currentSongIndex], playerFavBtn);
});

function formatTime(seconds) {
    let min = Math.floor(seconds / 60);
    let sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0'+sec : sec}`;
}

globalAudio.addEventListener("play", () => { 
    mainPlayBtn.innerHTML = '<i class="fas fa-pause"></i>'; playerImg.classList.add("spinning"); 
});

globalAudio.addEventListener("pause", () => {
    mainPlayBtn.innerHTML = '<i class="fas fa-play"></i>'; playerImg.classList.remove("spinning"); 
});

globalAudio.addEventListener("loadeddata", () => { 
    totalDurationEl.textContent = formatTime(globalAudio.duration); currentTimeEl.textContent = "0:00"; 
});

globalAudio.addEventListener("waiting", () => {
    mainPlayBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
});

globalAudio.addEventListener("playing", () => {
    mainPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
    playerImg.classList.add("spinning");
});

mainPlayBtn.addEventListener("click", () => {
    // 💉 JARING PENGAMAN: Cek apakah src-nya benar-benar URL lagu, bukan URL website kosong!
    if (!globalAudio.src || globalAudio.src.endsWith("index.html") || globalAudio.src === window.location.href) {
        showToast("⚠️ Pilih lagu dulu dari daftar!");
        return; // Hentikan fungsi!
    }

    // Kalau aman, baru boleh play / pause
    if (globalAudio.paused) { 
        globalAudio.play(); 
    } else { 
        globalAudio.pause(); 
    }
});

globalAudio.addEventListener("timeupdate", () => {
    if (globalAudio.duration) {
        progressBar.style.width = `${(globalAudio.currentTime / globalAudio.duration) * 100}%`;
        currentTimeEl.textContent = formatTime(globalAudio.currentTime);
    }
});

globalAudio.addEventListener("ended", () => {
    if (isShuffle) {
        playSong(Math.floor(Math.random() * currentPlaylist.length));
    } else {
        if (currentSongIndex + 1 < currentPlaylist.length) {
            playSong(currentSongIndex + 1);
        } else {
            const lastSong = currentPlaylist[currentPlaylist.length - 1];
            searchInput.value = lastSong.primaryGenreName || "pop"; 
            isAutoRadioMode = true; 
            searchButton.click(); 
        }
    }
});

let isDragging = false; 
function setAudioProgress(event) {
    const rect = progressContainer.getBoundingClientRect();
    let clickX = event.clientX - rect.left;
    if (clickX < 0) clickX = 0;
    if (clickX > rect.width) clickX = rect.width;
    if (globalAudio.duration) { globalAudio.currentTime = (clickX / rect.width) * globalAudio.duration; }
}
progressContainer.addEventListener("mousedown", (event) => { event.preventDefault(); isDragging = true; setAudioProgress(event); });
document.addEventListener("mousemove", (event) => { if (isDragging) setAudioProgress(event); });
document.addEventListener("mouseup", () => { isDragging = false; });

shuffleBtn.addEventListener("click", () => {
    isShuffle = !isShuffle;
    shuffleBtn.style.color = isShuffle ? "#a855f7" : "#b3b3b3";
});

repeatBtn.addEventListener("click", () => {
    isRepeat = !isRepeat;
    globalAudio.loop = isRepeat;
    repeatBtn.style.color = isRepeat ? "#a855f7" : "#b3b3b3";
});

globalAudio.volume = 1; 
let previousVolume = 1; 
function updateVolumeIcon(vol) {
    volumeBtn.className = ""; 
    if (vol === 0) { volumeBtn.className = "fas fa-volume-mute"; volumeBtn.style.color = "#e91429"; } 
    else if (vol < 0.5) { volumeBtn.className = "fas fa-volume-down"; volumeBtn.style.color = "#b3b3b3"; } 
    else { volumeBtn.className = "fas fa-volume-up"; volumeBtn.style.color = "#b3b3b3"; }
}
volumeSlider.addEventListener("input", (e) => {
    globalAudio.volume = e.target.value / 100;
    updateVolumeIcon(globalAudio.volume);
});
volumeBtn.addEventListener("click", () => {
    if (globalAudio.volume > 0) {
        previousVolume = globalAudio.volume; 
        globalAudio.volume = 0; volumeSlider.value = 0; 
    } else {
        globalAudio.volume = previousVolume || 1; 
        volumeSlider.value = previousVolume * 100 || 100; 
    }
    updateVolumeIcon(globalAudio.volume);
});

// ==========================================
// 13. SENSOR DROPDOWN PROFIL (AVATAR)
// ==========================================

// 1. Saklar Buka/Tutup Menu saat Avatar diklik
if (userAvatar) {
    userAvatar.addEventListener("click", () => {
        profileDropdown.classList.toggle("show");
    });
}

// 2. Pasang Aksi "Bohongan" (Dummy) untuk Menu di dalamnya
document.getElementById("btn-profile").addEventListener("click", () => {
    showToast("👤 Halaman Profil masih dalam pengembangan.");
    profileDropdown.classList.remove("show"); // Tutup dropdown otomatis!
});

document.getElementById("btn-settings").addEventListener("click", () => {
    showToast("⚙️ Pengaturan belum tersedia.");
    profileDropdown.classList.remove("show");
});

document.getElementById("logout-btn").addEventListener("click", () => {
    showToast("👋 Berhasil Keluar (Logout).");
    profileDropdown.classList.remove("show");
});

// ==========================================
// 14. SENSOR NOTIFIKASI
// ==========================================

if (bellIcon) {
    bellIcon.addEventListener ("click", () => {
        notifDropdown.classList.toggle("show");

    if (notifBadge) {
        notifBadge.style.display = "none";
        }
    });
}

// ==========================================
// 15. SMART NAVBAR (SCROLL-TO-HIDE)
// ==========================================

let lastScrollValue = 0; // Memori untuk mengingat posisi scroll terakhir

mainContentArea.addEventListener("scroll", () => {
    let currentScrollValue = mainContentArea.scrollTop;

     // Tutup dropdown kalau lagi kebuka
    recentContainer.classList.remove("show");
    if (typeof profileDropdown !== 'undefined' && profileDropdown) {
        profileDropdown.classList.remove("show");
    }

    // 1. Kalau layar mentok di paling atas (0px), WAJIB MUNCUL!
    if (currentScrollValue <= 0) {
        topNav.classList.remove("hidden");
    } 
    // 2. Kalau scroll turun, SEMBUNYI!
    else if (currentScrollValue > lastScrollValue) {
        topNav.classList.add("hidden"); 
    } 
    // 3. 💉 OBAT ANTI-MUNCUL SENDIRI: Kalau scroll naik, harus kerasa naiknya (selisih > 5px), baru muncul!
    // Ini akan mencegah "micro-bounce" saat mentok di ujung bawah layar.
    else if (currentScrollValue < lastScrollValue - 5) {
        topNav.classList.remove("hidden"); 
    }

    lastScrollValue = currentScrollValue;
});

/* ==========================================
   16. KEYBOARD SHORTCUTS 
   ========================================== */


   document.addEventListener("keydown", (event) => {

    console.log("Tombol yang ditekan:", event.key);
   
   if (document.activeElement === searchInput) {
    return;
   }

   switch (event.key.toLowerCase()) {

        case " ":
            event.preventDefault();
            mainPlayBtn.click();
            break;

        case "arrowleft":
            if (globalAudio.src) {
                globalAudio.currentTime -=5;}            
            break;
        
        case "arrowright":
            if (globalAudio.src) {
                globalAudio.currentTime +=5;}
            break;

        case "m":
            volumeBtn.click();
            break;
   }
});