// ui.js — render helpers and local favorite storage
function renderGrid(container, items) {
    if (!items || items.length === 0) {
        container.innerHTML = '<p class="loading">No results found.</p>';
        return;
    }
    container.innerHTML = items.map(item => {
        // some API returns nested objects
        const id = item.mal_id || item.entry?.mal_id || item.id;
        const title = item.title || item.name || (item.entry && item.entry.title);
        const img = (item.images && item.images.jpg && item.images.jpg.image_url) || (item.image_url) || 'assets/images/placeholder.jpg';
        const score = item.score ? `Score: ${item.score}` : '';
        return `
      <a class="card" href="anime.html?id=${id}">
        <img src="${img}" alt="${escapeHtml(title)}" loading="lazy" />
        <h3>${escapeHtml(title)}</h3>
        <p class="muted">${score}</p>
      </a>`;
    }).join('');
}

function renderPagination(container, page, onChange) {
    container.innerHTML = '';
    const prev = document.createElement('button');
    prev.textContent = 'Prev';
    prev.disabled = page <= 1;
    prev.onclick = () => onChange(page - 1);
    const next = document.createElement('button');
    next.textContent = 'Next';
    next.onclick = () => onChange(page + 1);
    container.appendChild(prev);
    const p = document.createElement('div');
    p.textContent = `Page ${page}`;
    p.style.padding = '8px 12px';
    container.appendChild(p);
    container.appendChild(next);
}

function animeDetailTemplate(data) {
    const id = data.mal_id;
    const title = data.title;
    const img = data.images?.jpg?.image_url || 'assets/images/placeholder.jpg';
    const synopsis = data.synopsis || 'No synopsis available.';
    const score = data.score ? `Score: ${data.score}` : 'N/A';
    const genres = (data.genres || []).map(g => g.name).join(', ');
    const episodes = data.episodes || '—';
    return `
    <div class="anime-detail" style="display:grid;grid-template-columns:280px 1fr;gap:20px;">
      <div>
        <img src="${img}" alt="${escapeHtml(title)}" style="width:100%;border-radius:12px" />
        <div style="margin-top:12px;display:flex;gap:8px;">
          <button class="btn" onclick="addFavorite(${id})">❤ Favorite</button>
          <a class="btn" href="https://myanimelist.net/anime/${id}" target="_blank">Open on MAL</a>
        </div>
      </div>
      <div>
        <h1>${escapeHtml(title)}</h1>
        <p class="muted">Score: ${score} • Episodes: ${episodes} • Genres: ${escapeHtml(genres)}</p>
        <h3>Synopsis</h3>
        <p>${escapeHtml(synopsis)}</p>
      </div>
    </div>
  `;
}

/* favorites — store ids in localStorage */
function getFavorites() {
    try {
        return JSON.parse(localStorage.getItem('animeverse_favs') || '[]');
    } catch (e) { return []; }
}
function addFavorite(id) {
    const arr = getFavorites();
    if (!arr.includes(id)) {
        arr.push(id);
        localStorage.setItem('animeverse_favs', JSON.stringify(arr));
        alert('Added to favorites');
    } else {
        alert('Already in favorites');
    }
}
function removeFavorite(id) {
    let arr = getFavorites();
    arr = arr.filter(x => x !== id);
    localStorage.setItem('animeverse_favs', JSON.stringify(arr));
}

/* small helpers */
function escapeHtml(s) {
    if (!s) return '';
    return String(s)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", "&#39;");
}
