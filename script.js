console.log("Audio Verse is ready to be reassembled!");

// ==========================================
// BAB 1: DOM ELEMENTS 
// ==========================================

// Sidebar
const sidebar = document.querySelector(".sidebar");
const menuToggleBtn = document.getElementById("menu-toggle-btn");

// Top Navigation Bar
const topNav = document.querySelector(".top-nav");
const searchButton = document.getElementById("search-button");
const searchInput = document.getElementById("search-input");
const recentContainer = document.getElementById("recent-searches-container");
const resultsList = document.getElementById("results-list");

const bellIcon = document.getElementById("bell-icon");
const userAvatar = document.getElementById("user-avatar");
const profileDropdown = document.getElementById("profile-dropdown");
const notifDropdown = document.getElementById("notif-dropdown");
const notifBadge = document.getElementById("notif-badge");

// Main Content Area (Primary Section)
const mainContentArea = document.querySelector(".main-content");
const heroBanner = document.getElementById("hero-banner");
const heroPlayBtn = document.getElementById("hero-play-btn");

const moodCards = document.querySelectorAll(".mood-card");
const moodSection = document.getElementById("mood-section");
const moodToFavBtn = document.getElementById("mood-to-fav");

const favoriteList = document.getElementById("favorites-list");
const favoritesSection = document.getElementById("favorites-section");
const clearFavoritesButton = document.getElementById("clear-favorites-button");

const navHome = document.getElementById("nav-home");

const backToHomeBtn = document.getElementById("back-to-home-btn");
const modalOverlay = document.getElementById("confirm-modal");
const modalCancelBtn = document.getElementById("modal-cancel-btn");
const modalConfirmBtn = document.getElementById("modal-confirm-btn");
const resultSection = document.getElementById("result-section");

const paginationControls = document.getElementById("pagination-controls");

//Song Detail Page
const globalAudio = document.getElementById("main-audio");
const playerTitle = document.getElementById("player-title");
const playerArtist = document.getElementById("player-artist");
const playerImg = document.getElementById("player-img");
const playerFavBtn = document.getElementById("player-fav-btn"); 

//Bottom Navigation Bar
const mainPlayBtn = document.getElementById("main-play-btn");
const prevBtn = document.getElementById("prev-btn"); 
const nextBtn = document.getElementById("next-btn"); 
const shuffleBtn = document.getElementById("shuffle-btn");
const repeatBtn = document.getElementById("repeat-btn");
const shareBtn = document.getElementById("share-btn");

const progressBar = document.getElementById("progress-bar");
const progressContainer = document.getElementById("progress-container");
const currentTimeEl = document.getElementById("current-time");
const totalDurationEl = document.getElementById("total-duration");

const volumeBtn = document.getElementById("volume-btn");
const volumeSlider = document.getElementById("volume-slider");

const navExplore = document.getElementById("nav-explore");
const navLibrary = document.getElementById("nav-library");

//Share Detail 
const shareModal = document.getElementById("share-modal");
const closeShareBtn = document.getElementById("close-share-btn");
const shareLinkInput = document.getElementById("share-link-input");
const copyLinkBtn = document.getElementById("copy-link-btn");
const shareWa = document.getElementById("share-wa");
const shareTw = document.getElementById("share-tw");
const shareFb = document.getElementById("share-fb");

// ==========================================
// BAB 2: STATE & MEMORY (VARIABLES)
// ==========================================

let toastTimer;
let favorites = JSON.parse(localStorage.getItem("myFavorites")) || [];
let recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
let currentPlaylist = []; 
let currentSongIndex = 0; 
let isAutoRadioMode = false; 
let isShuffle = false;
let isRepeat = false;
let isDragging = false; 
let lastScrollValue = 0;
let previousVolume = 1; 
let allFetchedSongs = [];
let currentPage = 1;
const itemsPerPage = 12;

// Power Button: Load Favorites & Recent Searches on Page Load
renderFavorites();
renderRecentSearches();
globalAudio.volume = 1; 

// ==========================================
// BAB 3: UTILITIES (HELPER FUNCTIONS)
// ==========================================

// Displaying a Black Notification Pop-up
function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer); 
    toastTimer = setTimeout(() => { toast.classList.remove("show"); }, 3000); 
}

// Converting a mathematical count of seconds into a minutes:seconds format
function formatTime(seconds) {
    let min = Math.floor(seconds / 60);
    let sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0'+sec : sec}`;
}

// Factory Function 
function createSongCard(song, index, sourceArray) {
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
        </div>
    `;
    
    if (song.previewUrl) {
        card.querySelector(".play-overlay").addEventListener("click", () => {
            currentPlaylist = sourceArray; 
            playSong(index); 
        });
    }

    const heartBtn = card.querySelector(".heart-btn");
    heartBtn.addEventListener("click", () => toggleFavorite(song, heartBtn));

    return card;
}

// Format Volume Icon
function updateVolumeIcon(vol) {
    volumeBtn.className = ""; 
    if (vol === 0) { volumeBtn.className = "fas fa-volume-mute"; volumeBtn.style.color = "#e91429"; } 
    else if (vol < 0.5) { volumeBtn.className = "fas fa-volume-down"; volumeBtn.style.color = "#b3b3b3"; } 
    else { volumeBtn.className = "fas fa-volume-up"; volumeBtn.style.color = "#b3b3b3"; }
}

// Set Audio Progress based on Click or Touch
function setAudioProgress(event) {
    const rect = progressContainer.getBoundingClientRect();
    
    // To check whether this is a touch (finger) or a mouse click
    let clientX = event.type.includes("touch") ? event.touches[0].clientX : event.clientX;
    
    let clickX = clientX - rect.left;
    if (clickX < 0) clickX = 0;
    if (clickX > rect.width) clickX = rect.width;
    
    if (globalAudio.duration) { 
        globalAudio.currentTime = (clickX / rect.width) * globalAudio.duration; 
    }
}

// Scroll to Results Section 
function scrollToResults() {
    const resultSec = document.getElementById("result-section");
    mainContentArea.scrollTo({
        top: resultSec.offsetTop - 100,
        behavior: "smooth"
    });
}

// Heart Icon Update for Player
function updatePlayerHeart(song) {
    const isFav = favorites.some((f) => f.trackId === song.trackId);
    playerFavBtn.innerHTML = isFav ? '<i class="fas fa-heart" style="color: #ff3b3b;"></i>' : '<i class="far fa-heart"></i>';
}

// Navigation Tabs 
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
    
    renderFavorites();
}

// ==========================================
// BAB 4: CORE LOGIC (PRIMARY FUNCTIONS)
// ==========================================

// Logic Search + API
async function fetchSearchResults(query) {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=60`;

    resultsList.innerHTML = `
        <div class="status-state">
            <div class="music-wave">
                <div class="bar"></div><div class="bar"></div>
                <div class="bar"></div><div class="bar"></div><div class="bar"></div>
            </div>
            <p>Tuning audio frequencies...</p>
        </div>`;

    // Clear the previous page controls while the new search is loading.
    if (paginationControls) paginationControls.innerHTML = "";

    let results;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`iTunes Search API returned HTTP ${response.status}`);
        }

        const data = await response.json();
        if (!Array.isArray(data.results)) {
            throw new Error("The iTunes Search API returned an unexpected response.");
        }
        results = data.results;
    } catch (error) {
        console.error("Search request failed:", error);
        resultsList.innerHTML = `
            <div class="status-state">
                <i class="fas fa-exclamation-triangle" style="color: #e91429;"></i>
                <p>An error occurred while fetching search results. Please try again.</p>
            </div>`;
        return;
    }

    // Keep rendering outside the fetch try/catch so UI bugs are not mislabeled
    // as network/API failures.
    allFetchedSongs = results;
    currentPage = 1;
    renderPage(currentPage);
}

// Global Music Player Control (Primary)
function handlePlaybackError(error) {
    console.error("Audio playback failed:", error);

    if (error && error.name === "NotAllowedError") {
        showToast("Playback was blocked by the browser. Press Play to start the song.");
    } else {
        showToast("This audio preview could not be played. Try another track.");
    }
}

function requestAudioPlayback() {
    const playRequest = globalAudio.play();
    if (playRequest && typeof playRequest.catch === "function") {
        playRequest.catch(handlePlaybackError);
    }
    return playRequest;
}

function playSong(index) {
    if (currentPlaylist.length === 0) return;

    // Keep the requested index inside the current playlist.
    currentSongIndex = ((index % currentPlaylist.length) + currentPlaylist.length) % currentPlaylist.length;
    const song = currentPlaylist[currentSongIndex];

    if (!song || !song.previewUrl) {
        showToast("This song does not have a playable preview.");
        return;
    }

    const artwork = song.artworkUrl100 || "";
    const highResImage = artwork.replace("100x100bb.jpg", "300x300bb.jpg") || artwork;

    playerTitle.textContent = song.trackName || song.collectionName || "Unknown track";
    playerArtist.textContent = song.artistName || "Unknown artist";
    if (highResImage) playerImg.src = highResImage;
    updatePlayerHeart(song);

    // Reset the previous preview before loading the newly selected one.
    globalAudio.pause();
    globalAudio.src = song.previewUrl;
    globalAudio.load();
    requestAudioPlayback();

    // Media Session is optional; it must never prevent playback on unsupported browsers.
    if ("mediaSession" in navigator && typeof window.MediaMetadata === "function") {
        try {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: song.trackName || song.collectionName || "Unknown track",
                artist: song.artistName || "Unknown artist",
                album: "Audio Verse",
                artwork: highResImage
                    ? [{ src: highResImage, sizes: "300x300", type: "image/jpeg" }]
                    : []
            });
            navigator.mediaSession.setActionHandler("play", requestAudioPlayback);
            navigator.mediaSession.setActionHandler("pause", () => globalAudio.pause());
            navigator.mediaSession.setActionHandler("previoustrack", () => prevBtn.click());
            navigator.mediaSession.setActionHandler("nexttrack", () => nextBtn.click());
        } catch (error) {
            console.warn("Media Session setup was unavailable:", error);
        }
    }
}

// Toggle Favorite Logic
function toggleFavorite(song, heartBtnElement) {
    const indexFav = favorites.findIndex((favSong) => favSong.trackId === song.trackId);
    if (indexFav === -1) {
        favorites.push(song);
        if(heartBtnElement) heartBtnElement.innerHTML = '<i class="fas fa-heart" style="color: #ff3b3b;"></i>';
        showToast(`✅ Added to favorites!`);
    } else {
        favorites.splice(indexFav, 1);
        if(heartBtnElement) heartBtnElement.innerHTML = '<i class="far fa-heart"></i>';
        showToast(`🗑️ Removed from favorites!`);
    }
    localStorage.setItem("myFavorites", JSON.stringify(favorites));
    renderFavorites();
    updatePlayerHeart(song); 
}


// ==========================================
// BAB 5: UI UPDATES (SCREEN PRINTING FUNCTIONS) 
// ==========================================  

// Rendering Search Results
function renderResults(songs) {
    resultsList.innerHTML = "";

    if (songs.length === 0) {
        resultsList.innerHTML = `<div class="status-state"><i class="fas fa-search-minus"></i><p>Oops, the audio wasn't found.</p></div>`;
        return;
    }

    currentPlaylist = songs; 

    songs.forEach((song, index) => {
        const card = createSongCard(song, index, songs); 
        resultsList.appendChild(card);
    });

    // Do not simulate a delayed song click here. Browsers commonly block audio
    // started from setTimeout because it is no longer a direct user gesture.
    if (isAutoRadioMode && songs.length > 0) {
        isAutoRadioMode = false;
        showToast("🎵 Playlist ready! Select a track to start listening.");
    }
}

// Handle Recent Searches Display
function renderRecentSearches() {
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

// Handle Favorite List Rendering
function renderFavorites() {
    favoriteList.innerHTML = ""; 

    if (favorites.length === 0) {
        favoriteList.innerHTML = `<div class="status-state"><i class="fas fa-heart-broken"></i><p>No favorite songs yet.<br>Search for songs and click the heart icon!</p></div>`;
        return;
    }

    favorites.forEach((song, index) => {
        const cardFav = createSongCard(song, index, favorites); 
        favoriteList.appendChild(cardFav);
    });
}

// ! PAGINATION ! //
function renderPage(page) {
    const totalPages = Math.max(1, Math.ceil(allFetchedSongs.length / itemsPerPage));
    currentPage = Math.min(Math.max(1, page), totalPages);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const songsForThisPage = allFetchedSongs.slice(startIndex, endIndex);

    renderResults(songsForThisPage);
    renderPagination(allFetchedSongs.length);
}

function renderPagination(totalItems) {
    // A missing pagination element should not prevent search results from rendering.
    if (!paginationControls) {
        console.error('Pagination container #pagination-controls was not found in the page.');
        return;
    }

    paginationControls.innerHTML = "";

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return;

    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "page-btn";
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.setAttribute("aria-label", "Previous page");
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener("click", () => {
        renderPage(currentPage - 1);
        scrollToResults();
    });
    paginationControls.appendChild(prevBtn);

    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement("button");
        pageBtn.type = "button";
        pageBtn.className = "page-btn";
        pageBtn.textContent = i;
        pageBtn.setAttribute("aria-label", `Page ${i}`);
        pageBtn.setAttribute("aria-current", i === currentPage ? "page" : "false");

        if (i === currentPage) pageBtn.classList.add("active");

        pageBtn.addEventListener("click", () => {
            renderPage(i);
            scrollToResults();
        });
        paginationControls.appendChild(pageBtn);
    }

    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "page-btn";
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.setAttribute("aria-label", "Next page");
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener("click", () => {
        renderPage(currentPage + 1);
        scrollToResults();
    });
    paginationControls.appendChild(nextBtn);
}

// ==========================================
// BAB 6: EVENT LISTENERS (All Sensors)
// ==========================================

// Navigation & Sidebar Sensors
navHome.addEventListener("click", openHomeTab);
backToHomeBtn.addEventListener("click", openHomeTab);
if(navLibrary) navLibrary.addEventListener("click", openLibraryTab);
moodToFavBtn.addEventListener("click", openLibraryTab); 

if(navExplore) navExplore.addEventListener("click", () => showToast("🚀 The Explore feature is coming soon! Stay tuned!"));

    // Hamburger Menu Toggle (for Mobile Versions)
    menuToggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    });

    // Search Button Event
    searchButton.addEventListener("click", () => {
    openHomeTab();
    
    const query = searchInput.value.trim();
    if (query) { 
        const existingIndex = recentSearches.indexOf(query);
        if (existingIndex !== -1) { recentSearches.splice(existingIndex, 1); }
        recentSearches.unshift(query);
        if (recentSearches.length > 5) { recentSearches.pop(); }
        localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
        renderRecentSearches(); 
        recentContainer.classList.remove("show"); 
        fetchSearchResults(query);
        document.getElementById("result-section").scrollIntoView({ behavior: `smooth`});
    } else {
        showToast("🔍 Enter a search keyword!");
    }
    });

    searchInput.addEventListener("focus", () => { if (recentSearches.length > 0) recentContainer.classList.add("show"); });
    document.addEventListener("click", (event) => {
    // 1. Hide Recent Searches Dropdown if clicked outside
    if (!searchInput.contains(event.target) && !recentContainer.contains(event.target)) {
        recentContainer.classList.remove("show"); 
    }
    // 2. Hide Profile Dropdowns if clicked outside
    if (!userAvatar.contains(event.target) && !profileDropdown.contains(event.target)) {
        profileDropdown.classList.remove("show");
    }
    // 3. Hide Notification Dropdown if clicked outside
    if (bellIcon && notifDropdown && !bellIcon.contains(event.target) && !notifDropdown.contains(event.target)) {
        notifDropdown.classList.remove("show");
    }
    });

    searchInput.addEventListener("keypress", (event) => { 
    if (event.key === "Enter") searchButton.click(); 
    });


// Mood Card Sensors
if (heroPlayBtn) {
    heroPlayBtn.addEventListener("click", () => {
        const editorPlaylists = ["Powfu", "Payung Teduh", "Sleepy Fish", "Anri (杏里)", "slipfunc", "Diskoria", "Danilla", "White Soes & The Couples Company"];
        const randomIndex = Math.floor(Math.random() * editorPlaylists.length);
        const selectedKeyword = editorPlaylists[randomIndex];
        searchInput.value = selectedKeyword;
        isAutoRadioMode = true; 
        searchButton.click();
        scrollToResults();
        showToast(`🎵 ${selectedKeyword.toUpperCase()}!`);
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
            scrollToResults();
            showToast(`🎵 ${selectedKeyword.toUpperCase()}!`);
        }
    });
});

// Scroll Sensor for Smart Navbar
mainContentArea.addEventListener("scroll", () => {
    let currentScrollValue = mainContentArea.scrollTop;

    recentContainer.classList.remove("show");
    if (typeof profileDropdown !== 'undefined' && profileDropdown) {
        profileDropdown.classList.remove("show");
    }

    // 1. Conditional: if the scroll is at the very top (0px), the navbar MUST SHOW!
    if (currentScrollValue <= 0) {
        topNav.classList.remove("hidden");
    } 
    // 2. Conditional: if the scroll is going down, hide the navbar!
    else if (currentScrollValue > lastScrollValue) {
        topNav.classList.add("hidden"); 
    } 
    // 3. Conditional: if the scroll is going up and the difference is significant, show the navbar!
    else if (currentScrollValue < lastScrollValue - 5) {
        topNav.classList.remove("hidden"); 
    }

    lastScrollValue = currentScrollValue;
});

// Bottom Music Player Sensors
playerFavBtn.addEventListener("click", () => {
    if (currentPlaylist.length === 0) return;
    toggleFavorite(currentPlaylist[currentSongIndex], playerFavBtn);
});

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

mainPlayBtn.addEventListener("click", () => {
    if (!globalAudio.currentSrc || globalAudio.currentSrc === window.location.href) {
        showToast("⚠️ Choose a song from the list first!");
        return;
    }

    if (globalAudio.paused) {
        requestAudioPlayback();
    } else {
        globalAudio.pause();
    }
});

// Share Button Sensor
// Guard all share elements so an incomplete share modal can never stop the
// rest of the music-player script from initializing.
if (
    shareBtn && shareModal && closeShareBtn && shareLinkInput && copyLinkBtn &&
    shareWa && shareTw && shareFb
) {
    shareBtn.addEventListener("click", () => {
        const currentTitle = playerTitle.textContent.trim();
        const currentArtist = playerArtist.textContent.trim();
        
        const isLocalHost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
        const url = isLocalHost
                    ? "https://audio-verses.netlify.app/"
                    : window.location.href;
        const hasCurrentTrack = currentTitle && currentTitle !== "No song playing";

        const shareText = hasCurrentTrack
            ? `Currently listening to ${currentTitle} by ${currentArtist} on Audio Verse 🎧`
            : "Discover your favorite music vibes on Audio Verse 🎧";

        shareLinkInput.value = url;
        shareWa.onclick = () => window.open(
            `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${url}`)}`,
            "_blank",
            "noopener,noreferrer"
        );
        shareTw.onclick = () => window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`,
            "_blank",
            "noopener,noreferrer"
        );
        shareFb.onclick = () => window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            "_blank",
            "noopener,noreferrer"
        );

        shareModal.classList.add("show");
        shareModal.setAttribute("aria-hidden", "false");
    });

    const closeShareModal = () => {
        shareModal.classList.remove("show");
        shareModal.setAttribute("aria-hidden", "true");
    };

    closeShareBtn.addEventListener("click", closeShareModal);
    shareModal.addEventListener("click", (event) => {
        if (event.target === shareModal) closeShareModal();
    });

    copyLinkBtn.addEventListener("click", async () => {
        try {
            await navigator.clipboard.writeText(shareLinkInput.value);
            const originalText = copyLinkBtn.textContent;
            copyLinkBtn.textContent = "Copied!";
            copyLinkBtn.style.backgroundColor = "#1DB954";
            showToast("🔗 Link copied!");
            setTimeout(() => {
                copyLinkBtn.textContent = originalText;
                copyLinkBtn.style.backgroundColor = "";
            }, 2000);
        } catch (error) {
            console.error("Could not copy share link:", error);
            shareLinkInput.focus();
            shareLinkInput.select();
            showToast("Select the link and copy it manually.");
        }
    });
} else {
    console.warn("Share UI is incomplete. Music playback will continue without sharing controls.");
}


// Global Audio Event Listeners
globalAudio.addEventListener("play", () => { 
    mainPlayBtn.innerHTML = '<i class="fas fa-pause"></i>'; playerImg.classList.add("spinning"); 
});

globalAudio.addEventListener("pause", () => {
    mainPlayBtn.innerHTML = '<i class="fas fa-play"></i>'; playerImg.classList.remove("spinning"); 
});

globalAudio.addEventListener("playing", () => {
    mainPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
    playerImg.classList.add("spinning");
});

globalAudio.addEventListener("loadeddata", () => { 
    totalDurationEl.textContent = formatTime(globalAudio.duration); currentTimeEl.textContent = "0:00"; 
});

globalAudio.addEventListener("waiting", () => {
    mainPlayBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
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

// Favorites Area Sensors
clearFavoritesButton.addEventListener("click", () => {
    if (favorites.length === 0) { showToast("⚠️ Favorites list is empty!"); return; }
    modalOverlay.classList.add("show");
});

modalCancelBtn.addEventListener("click", () => modalOverlay.classList.remove("show"));
modalConfirmBtn.addEventListener("click", () => {
    favorites = [];
    localStorage.setItem("myFavorites", JSON.stringify(favorites));
    renderFavorites();
    modalOverlay.classList.remove("show");
    showToast("🗑️ Favorites cleared!");
});

// Keyboard & Scroll Sensors

// 1. Mouse Sensor (PC / Laptop)
progressContainer.addEventListener("mousedown", (event) => { 
    event.preventDefault(); 
    isDragging = true; 
    setAudioProgress(event); 
});

document.addEventListener("mousemove", (event) => { 
    if (isDragging) setAudioProgress(event); 
});

document.addEventListener("mouseup", () => { 
    isDragging = false; 
});

// 2 . Touch Sensor (Mobile / Tablet)
progressContainer.addEventListener("touchstart", (event) => { 
    isDragging = true; 
    setAudioProgress(event); 
}, { passive: true });

document.addEventListener("touchmove", (event) => { 
    if (isDragging) {
        event.preventDefault(); 
        setAudioProgress(event); 
    }
}, { passive: false });

document.addEventListener("touchend", () => { 
    isDragging = false; 
});

shuffleBtn.addEventListener("click", () => {
    isShuffle = !isShuffle;
    shuffleBtn.style.color = isShuffle ? "#a855f7" : "#b3b3b3";
});

repeatBtn.addEventListener("click", () => {
    isRepeat = !isRepeat;
    globalAudio.loop = isRepeat;
    repeatBtn.style.color = isRepeat ? "#a855f7" : "#b3b3b3";
});

// Volume Control Sensors
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

// Profile and Bell Notification Sensors
    // 1. Dropdown Profile Toggle
    if (userAvatar) {
        userAvatar.addEventListener("click", () => {
            profileDropdown.classList.toggle("show");
    });
}

    // 2. Bell Notification Toggle
    if (bellIcon) {
        bellIcon.addEventListener ("click", () => {
            notifDropdown.classList.toggle("show");

    if (notifBadge) {
            notifBadge.style.display = "none";
        }
    });
}

// * Still under development *
document.getElementById("btn-profile")?.addEventListener("click", () => {
    showToast("👤 The Profile page is still under development.");
    profileDropdown.classList.remove("show");
});

document.getElementById("btn-settings")?.addEventListener("click", () => {
    showToast("⚙️ Settings are not yet available.");
    profileDropdown.classList.remove("show");
});

document.getElementById("logout-btn").addEventListener("click", () => {
    showToast("👋 Still under development.");
    profileDropdown.classList.remove("show");
});

// Shortcuts for PC / Laptop Users
   document.addEventListener("keydown", (event) => {
    console.log("Button pressed:", event.key);
   
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