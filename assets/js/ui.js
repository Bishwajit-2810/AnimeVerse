/* ============================================================
   UI HELPERS + FAVORITES STORAGE (AnimeVerse Clean Version)
   ============================================================ */

/* Escape HTML to avoid injection */
function escapeHtml(s) {
  if (!s) return "";
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/* ============================================================
   GRID RENDERER — safe across all API responses
   ============================================================ */

function renderGrid(container, items) {
  if (!items || items.length === 0) {
    container.innerHTML = `<p class="loading">No results found.</p>`;
    return;
  }

  container.innerHTML = items
    .map(item => {
      const id =
        item.mal_id ||
        item.entry?.mal_id ||
        item.id;

      const title =
        item.title ||
        item.name ||
        item.entry?.title ||
        "Untitled";

      const img =
        item.images?.jpg?.image_url ||
        item.image_url ||
        "assets/images/placeholder.jpg";

      const score = item.score ? `⭐ ${item.score}` : "⭐ N/A";

      return `
        <a class="card" href="anime.html?id=${id}">
          <img src="${img}" alt="${escapeHtml(title)}" loading="lazy" class="poster"/>

          <div class="card-body">
            <div class="card-title">${escapeHtml(title)}</div>
            <div class="card-meta">${score}</div>
          </div>
        </a>`;
    })
    .join("");
}

/* ============================================================
   PAGINATION RENDERER
   ============================================================ */

function renderPagination(container, page, onChange) {
  container.innerHTML = "";

  const prev = document.createElement("button");
  prev.textContent = "← Prev";
  prev.className = "btn secondary";
  prev.disabled = page <= 1;
  prev.onclick = () => onChange(page - 1);

  const info = document.createElement("div");
  info.textContent = `Page ${page}`;
  info.style.padding = "8px 12px";
  info.style.color = "var(--muted)";

  const next = document.createElement("button");
  next.textContent = "Next →";
  next.className = "btn secondary";
  next.onclick = () => onChange(page + 1);

  container.append(prev, info, next);
}

/* ============================================================
   ANIME DETAIL TEMPLATE
   ============================================================ */

function animeDetailTemplate(data) {
  const id = data.mal_id;
  const title = data.title;
  const img = data.images?.jpg?.image_url || "assets/images/placeholder.jpg";
  const synopsis = data.synopsis || "No synopsis available.";
  const score = data.score ? data.score : "N/A";
  const genres = (data.genres || []).map(g => g.name).join(", ") || "—";
  const episodes = data.episodes || "—";

  return `
    <div class="anime-detail"
         style="display:grid;grid-template-columns:280px 1fr;gap:20px;">

      <div>
        <img src="${img}" alt="${escapeHtml(title)}" class="poster-lg"/>

        <div style="margin-top:12px;display:flex;gap:8px;">
          <button class="btn" onclick="toggleFavorite(${id})"
                  id="fav-btn">
            ${isFavorite(id) ? "❤️ In Favorites" : "🤍 Add to Favorites"}
          </button>

          <a class="btn secondary"
             href="https://myanimelist.net/anime/${id}"
             target="_blank">
             Open on MAL
          </a>
        </div>
      </div>

      <div>
        <h1>${escapeHtml(title)}</h1>

        <p class="muted">
          ⭐ Score: ${score} • Episodes: ${episodes} • Genres: ${escapeHtml(genres)}
        </p>

        <h3>Synopsis</h3>
        <p>${escapeHtml(synopsis)}</p>
      </div>
    </div>
  `;
}

/* ============================================================
   FAVORITES SYSTEM (clean + unified)
   ============================================================ */

const FAV_KEY = "animeverse_favs";

function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveFavorites(arr) {
  localStorage.setItem(FAV_KEY, JSON.stringify(arr));
}

/* Toggle add/remove */
function toggleFavorite(id) {
  let favs = getFavorites();
  const exists = favs.includes(id);

  if (exists) {
    favs = favs.filter(x => x !== id);
  } else {
    favs.push(id);
  }

  saveFavorites(favs);

  /* Update any button currently on screen */
  const btn = document.getElementById("fav-btn");
  if (btn) {
    btn.textContent = exists ? "🤍 Add to Favorites" : "❤️ In Favorites";
  }

  return !exists;
}

function isFavorite(id) {
  return getFavorites().includes(id);
}

/* Separate remover (used in favorites.html) */
function removeFavorite(id) {
  const favs = getFavorites().filter(x => x !== id);
  saveFavorites(favs);
}
