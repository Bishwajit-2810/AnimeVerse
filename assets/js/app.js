/* ============================================================
   AnimeVerse — Optimized App.js (Cleaner + Debounced + Safer)
   ============================================================ */

/* Utility: Escape HTML */
function esc(s) {
    return String(s || "").replace(/[&<>"]/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"
    }[c]));
}

/* ============================================================
   SEARCH SYSTEM  (Debounced + Safe)
============================================================ */

const searchInput = document.getElementById("nav-search-input");
const searchOpenBtn = document.getElementById("search-open");
const suggestionsBox = document.getElementById("suggestions");
const voiceBtn = document.getElementById("voice-btn");

let recentSearches = JSON.parse(localStorage.getItem("recent-searches") || "[]");

/* Save recent searches (max 5) */
function saveRecent(q) {
    if (!q.trim()) return;
    recentSearches = [q, ...recentSearches.filter(x => x !== q)].slice(0, 5);
    localStorage.setItem("recent-searches", JSON.stringify(recentSearches));
}

/* Render suggestion list */
function renderSuggestions(list) {
    if (!list?.length) {
        suggestionsBox.innerHTML = `
      <div style="padding:8px;color:var(--muted);font-size:.9rem">
        No results found.
      </div>`;
        return;
    }

    suggestionsBox.innerHTML = list.map(item => `
    <div class="suggest-item"
         onclick="location.href='anime.html?id=${item.mal_id}'"
         style="padding:10px;cursor:pointer;border-radius:10px;
                display:flex;gap:10px;align-items:center">

      <img src="${item.images?.jpg?.image_url}"
           style="width:40px;height:56px;border-radius:6px;object-fit:cover"/>

      <div>
        <div style="font-weight:600">${esc(item.title)}</div>
        <div style="color:var(--muted);font-size:.8rem">
          ${item.type || "Anime"} • ${item.year || "—"}
        </div>
      </div>
    </div>`).join("");
}

/* Expand search bar */
searchOpenBtn?.addEventListener("click", () => {
    searchInput.classList.toggle("expanded");
    if (searchInput.classList.contains("expanded")) {
        setTimeout(() => searchInput.focus(), 80);
    } else {
        suggestionsBox.classList.remove("visible");
    }
});

/* Keyboard shortcut: S */
document.addEventListener("keydown", e => {
    if (e.key.toLowerCase() === "s" && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.classList.add("expanded");
        setTimeout(() => searchInput.focus(), 80);
    }
});

/* ------------------------------
   Debounce: prevent API abuse
------------------------------ */
let searchTimer = null;
function debounceSearch(fn, delay = 350) {
    return (...args) => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => fn(...args), delay);
    };
}

async function searchHandler() {
    const q = searchInput.value.trim();
    if (!q) {
        suggestionsBox.classList.remove("visible");
        return;
    }

    try {
        const data = await searchAnime(q);
        suggestionsBox.classList.add("visible");
        renderSuggestions(data);
    } catch {
        suggestionsBox.innerHTML = `<div style="padding:8px;color:var(--muted)">Error loading results.</div>`;
    }
}

/* Apply debounce */
searchInput?.addEventListener("input", debounceSearch(searchHandler, 350));

/* Enter -> go to search.html */
searchInput?.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        const q = searchInput.value.trim();
        if (q) {
            saveRecent(q);
            location.href = `search.html?q=${encodeURIComponent(q)}`;
        }
    }
});

/* Voice search (desktop only now) */
if (voiceBtn) {
    voiceBtn.addEventListener("click", () => {
        if (!("webkitSpeechRecognition" in window)) {
            alert("Speech recognition not supported in this browser.");
            return;
        }
        const rec = new webkitSpeechRecognition();
        rec.lang = "en-US";
        rec.start();

        rec.onresult = async e => {
            const q = e.results[0][0].transcript;
            searchInput.value = q;
            searchInput.classList.add("expanded");

            const data = await searchAnime(q);
            suggestionsBox.classList.add("visible");
            renderSuggestions(data);
        };
    });
}

/* ============================================================
   MOBILE NAVIGATION
============================================================ */

const mobileToggle = document.getElementById("mobile-nav-toggle");
const mainNav = document.getElementById("main-nav");

mobileToggle?.addEventListener("click", () => {
    mainNav.classList.toggle("open");
});

/* Close menu when clicking link (mobile UX improvement) */
mainNav?.querySelectorAll("a").forEach(a =>
    a.addEventListener("click", () => {
        mainNav.classList.remove("open");
    })
);

/* ============================================================
   FAVORITES SYSTEM (clean)
============================================================ */

function getFavorites() {
    return JSON.parse(localStorage.getItem("favs") || "[]");
}

function toggleFavorite(id) {
    let favs = getFavorites();
    const exists = favs.includes(id);

    favs = exists ? favs.filter(x => x !== id) : [...favs, id];

    localStorage.setItem("favs", JSON.stringify(favs));
    return !exists;
}

function isFavorite(id) {
    return getFavorites().includes(id);
}

/* ============================================================
   GRID RENDERER
============================================================ */

function renderGrid(container, items) {
    if (!items?.length) {
        container.innerHTML = `<div style="color:var(--muted)">No results.</div>`;
        return;
    }

    container.innerHTML = items.map(it => `
    <a class="card" href="anime.html?id=${it.mal_id}">
      <img src="${it.images?.jpg?.image_url}" class="poster"/>
      <div class="card-body">
        <div class="card-title">${esc(it.title)}</div>
        <div class="card-meta">⭐ ${it.score || "N/A"}</div>
      </div>
    </a>`).join("");
}

/* ============================================================
   HERO CAROUSEL — Optimized but unchanged visually
============================================================ */

(async function initHeroCarousel() {
    const root = document.getElementById("hero-carousel");
    if (!root) return;

    const track = root.querySelector(".carousel-track");
    const dots = root.querySelector(".carousel-controls");

    try {
        const slides = await fetchTrendingAnime(15);

        track.innerHTML = "";
        dots.innerHTML = "";

        slides.forEach((it, index) => {
            const img = it.images?.jpg?.large_image_url || it.images?.jpg?.image_url;
            const synopsis = (it.synopsis || "").slice(0, 200) + "...";
            const genres = it.genres?.map(g => g.name).slice(0, 3).join(" • ") || "Anime";

            const slide = document.createElement("div");
            slide.className = "carousel-item";

            slide.innerHTML = `
        <div class="carousel-left">
          <div class="hero-v4-genres">${esc(genres)}</div>
          <h2 class="h-title">${esc(it.title)}</h2>
          <p class="h-desc">${esc(synopsis)}</p>

          <div style="display:flex;gap:10px;margin-top:14px">
            <div class="meta-pill">⭐ ${it.score || "N/A"}</div>
            <div class="meta-pill">Ep: ${it.episodes || "?"}</div>
          </div>

          <div style="margin-top:18px">
            <a class="btn primary" href="anime.html?id=${it.mal_id}">Read Now</a>
          </div>
        </div>

        <div class="carousel-poster" style="background-image:url('${img}')"></div>
      `;
            track.appendChild(slide);

            /* dots */
            const dot = document.createElement("div");
            dot.className = "dot";
            dot.addEventListener("click", () => {
                go(index);
                resetTimer();
            });
            dots.appendChild(dot);
        });

        /* Set initial left hero */
        if (slides.length) {
            const f = slides[0];
            document.getElementById("hero-title").textContent = f.title;
            document.getElementById("hero-desc").textContent = (f.synopsis || "").slice(0, 220);
            document.getElementById("hero-genres").textContent =
                f.genres?.map(g => g.name).slice(0, 3).join(" • ") || "Anime";

            document.getElementById("hero-read-btn").href = `anime.html?id=${f.mal_id}`;
            document.getElementById("hero-explore-btn").href = `anime.html?id=${f.mal_id}`;
        }

        /* Slider engine */
        let idx = 0;

        function go(i) {
            idx = (i + slides.length) % slides.length;
            track.style.transform = `translateX(${-idx * 100}%)`;

            [...dots.children].forEach((d, di) => {
                d.style.background = di === idx ? "var(--accent)" : "rgba(255,255,255,0.2)";
            });
        }

        let timer;
        function startTimer() {
            timer = setInterval(() => go(idx + 1), 4500);
        }
        function resetTimer() {
            clearInterval(timer);
            startTimer();
        }

        go(0);
        startTimer();

    } catch (err) {
        console.error("Carousel init failed:", err);
    }
})();
