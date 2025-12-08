/* ============================================================
   SEARCH SYSTEM
============================================================ */

const searchInput = document.getElementById("nav-search-input");
const searchOpenBtn = document.getElementById("search-open");
const suggestionsBox = document.getElementById("suggestions");
const voiceBtn = document.getElementById("voice-btn");

let recentSearches = JSON.parse(localStorage.getItem("recent-searches") || "[]");

function saveRecent(q) {
    if (!q.trim()) return;
    recentSearches = [q, ...recentSearches.filter(x => x !== q)].slice(0, 5);
    localStorage.setItem("recent-searches", JSON.stringify(recentSearches));
}

function renderSuggestions(list) {
    if (!list || list.length === 0) {
        suggestionsBox.innerHTML =
            `<div style="padding:8px;color:var(--muted);font-size:.9rem">
               No results found.
             </div>`;
        return;
    }

    suggestionsBox.innerHTML = list
        .map(
            item => `
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
        </div>`
        )
        .join("");
}

/* toggle search bar */
searchOpenBtn?.addEventListener("click", () => {
    searchInput.classList.toggle("expanded");
    if (searchInput.classList.contains("expanded")) {
        setTimeout(() => searchInput.focus(), 80);
    } else {
        suggestionsBox.classList.remove("visible");
    }
});

/* keyboard shortcut: S to focus */
document.addEventListener("keydown", e => {
    if (e.key.toLowerCase() === "s" && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.classList.add("expanded");
        setTimeout(() => searchInput.focus(), 80);
    }
});

/* on typing: fetch suggestions */
searchInput?.addEventListener("input", async () => {
    const q = searchInput.value.trim();
    if (!q) {
        suggestionsBox.classList.remove("visible");
        return;
    }

    const data = await searchAnime(q);
    suggestionsBox.classList.add("visible");
    renderSuggestions(data);
});

/* enter = go to search page */
searchInput?.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        const q = searchInput.value.trim();
        if (q) {
            saveRecent(q);
            location.href = `search.html?q=${encodeURIComponent(q)}`;
        }
    }
});

/* voice input */
voiceBtn?.addEventListener("click", () => {
    if (!("webkitSpeechRecognition" in window)) {
        alert("Speech recognition not supported in this browser.");
        return;
    }
    const rec = new webkitSpeechRecognition();
    rec.lang = "en-US";
    rec.start();

    rec.onresult = async (e) => {
        const q = e.results[0][0].transcript;
        searchInput.value = q;
        searchInput.classList.add("expanded");
        const data = await searchAnime(q);
        suggestionsBox.classList.add("visible");
        renderSuggestions(data);
    };
});

/* MOBILE NAVIGATION */
const mobileToggle = document.getElementById("mobile-nav-toggle");
const mainNav = document.getElementById("main-nav");

if (mobileToggle) {
    mobileToggle.addEventListener("click", () => {
        mainNav.classList.toggle("open");
    });
}


/* ============================================================
   FAVORITES SYSTEM
============================================================ */

function getFavorites() {
    return JSON.parse(localStorage.getItem("favs") || "[]");
}

function toggleFavorite(id) {
    let f = getFavorites();
    let added;

    if (f.includes(id)) {
        f = f.filter(x => x !== id);
        added = false;
    } else {
        f.push(id);
        added = true;
    }

    localStorage.setItem("favs", JSON.stringify(f));
    return added;
}

function isFavorite(id) {
    return getFavorites().includes(id);
}


/* ============================================================
   GRID RENDERER
============================================================ */

function renderGrid(container, items) {
    if (!items || !items.length) {
        container.innerHTML = `<div style="color:var(--muted)">No results.</div>`;
        return;
    }

    container.innerHTML = items
        .map(it => {
            const img = it.images?.jpg?.image_url;
            return `
        <a class="card" href="anime.html?id=${it.mal_id}">
          <img src="${img}" class="poster"/>
          <div class="card-body">
            <div class="card-title">${esc(it.title)}</div>
            <div class="card-meta">⭐ ${it.score || "N/A"}</div>
          </div>
        </a>`;
        })
        .join("");
}


/* ============================================================
   API HELPERS — FIXED FOR EXACTLY 15 ANIME
============================================================ */

async function fetchTrendingAnime(limit = 15) {
    const url = `https://api.jikan.moe/v4/anime?order_by=popularity&sort=asc&limit=${limit}`;
    const r = await fetch(url);
    const j = await r.json();
    return j.data || [];
}

async function fetchTopAnime(limit = 15) {
    const r = await fetch(`https://api.jikan.moe/v4/top/anime?limit=${limit}`);
    const j = await r.json();
    return j.data || [];
}


/* ============================================================
   HERO CAROUSEL — NOW USES 15 ITEMS
============================================================ */

(async function initHeroCarousel() {
    const root = document.getElementById("hero-carousel");
    if (!root) return;

    const track = root.querySelector(".carousel-track");
    const dots = root.querySelector(".carousel-controls");

    try {
        /* FIXED: 15 slides */
        const slides = await fetchTrendingAnime(15);

        track.innerHTML = "";
        dots.innerHTML = "";

        slides.forEach((it, index) => {
            const img = it.images?.jpg?.large_image_url || it.images?.jpg?.image_url;
            const synopsis = (it.synopsis || "No synopsis.").slice(0, 200) + "...";
            const genreNames = it.genres?.map(g => g.name).slice(0, 3).join(" • ") || "Anime";

            const slide = document.createElement("div");
            slide.className = "carousel-item";

            slide.innerHTML = `
        <div class="carousel-left">
          <div class="hero-v4-genres">${esc(genreNames)}</div>
          <h2 class="h-title">${esc(it.title)}</h2>
          <div class="h-desc">${esc(synopsis)}</div>

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

        /* HERO LEFT POPULATION */
        if (slides.length) {
            const f = slides[0];
            document.getElementById("hero-title").textContent = f.title;
            document.getElementById("hero-desc").textContent =
                (f.synopsis || "").slice(0, 220) + "...";
            document.getElementById("hero-genres").textContent =
                f.genres?.map(g => g.name).slice(0, 3).join(" • ") || "Anime";

            document.getElementById("hero-read-btn").href =
                `anime.html?id=${f.mal_id}`;
            document.getElementById("hero-explore-btn").href =
                `anime.html?id=${f.mal_id}`;
        }

        /* SLIDER ENGINE */
        let idx = 0;

        function go(i) {
            idx = (i + slides.length) % slides.length;
            track.style.transform = `translateX(${-idx * 100}%)`;

            [...dots.children].forEach((d, di) => {
                d.style.background =
                    di === idx ? "var(--accent)" : "rgba(255,255,255,0.2)";
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
        console.error("Hero carousel error:", err);
    }
})();
