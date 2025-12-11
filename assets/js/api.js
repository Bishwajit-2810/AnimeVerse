/* api.js — Jikan API helper layer (Safe Mode v2) */

const API = "https://api.jikan.moe/v4";

/* ========== HTML ESCAPE ========== */
function esc(s) {
    return String(s || "").replace(/[&<>"]/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"
    }[c]));
}

/* ========== GLOBAL SAFE FETCH HANDLER ========== */
async function safeFetch(url, retries = 3) {
    try {
        const res = await fetch(url);

        // Handle 429 Too Many Requests
        if (res.status === 429 && retries > 0) {
            console.warn("API LIMIT HIT — retrying in 1.3s:", url);
            await new Promise(r => setTimeout(r, 1300));
            return safeFetch(url, retries - 1);
        }

        // Other non-200 errors
        if (!res.ok) {
            console.error("API error:", res.status, url);
            return null;
        }

        const json = await res.json();
        return json?.data || null;

    } catch (err) {
        console.error("Network fetch failed:", err);
        return null;
    }
}

/* =====================
      GENRES
===================== */

let _genreCache = null;

async function fetchGenres() {
    if (_genreCache) return _genreCache;

    const data = await safeFetch(`${API}/genres/anime`);
    _genreCache = data || [];
    return _genreCache;
}

/* =====================
   ANIME DETAILS (Main)
===================== */

async function fetchAnimeDetails(id) {
    return await safeFetch(`${API}/anime/${id}`) || {};
}

async function fetchAnimeBasic(id) {
    return await safeFetch(`${API}/anime/${id}`) || {};
}

/* =====================
    TOP LISTS
===================== */

async function fetchTopBy(type = "bypopularity", page = 1) {
    return await safeFetch(`${API}/top/anime?page=${page}&filter=${type}`) || [];
}

/* =====================
      SEARCH
===================== */

async function searchAnime(q) {
    if (!q.trim()) return [];
    return await safeFetch(
        `${API}/anime?q=${encodeURIComponent(q)}&limit=10`
    ) || [];
}

/* ==============================
   GENRE FILTERED ANIME LIST
============================== */

async function fetchAnimeByGenre(genreId, page = 1) {
    return await safeFetch(
        `${API}/anime?genres=${genreId}&order_by=score&sort=desc&page=${page}`
    ) || [];
}

/* =====================
     TRENDING
===================== */

async function fetchTrendingAnime(limit = 15) {
    const data = await safeFetch(`${API}/top/anime?filter=bypopularity`);
    return data ? data.slice(0, limit) : [];
}

/* =====================
    TOP-RATED
===================== */

async function fetchTopAnime(limit = 15) {
    const data = await safeFetch(`${API}/top/anime?filter=airing`);
    return data ? data.slice(0, limit) : [];
}

/* ======================================================
   EXTRA ANIME DATA  
   Characters / Staff / Recommendations / Themes (OST)
======================================================*/

async function fetchAnimeCharacters(id) {
    return await safeFetch(`${API}/anime/${id}/characters`) || [];
}

async function fetchAnimeStaff(id) {
    return await safeFetch(`${API}/anime/${id}/staff`) || [];
}

async function fetchAnimeRecommendations(id) {
    return await safeFetch(`${API}/anime/${id}/recommendations`) || [];
}

async function fetchAnimeThemes(id) {
    return await safeFetch(`${API}/anime/${id}/themes`) || {
        openings: [],
        endings: []
    };
}
