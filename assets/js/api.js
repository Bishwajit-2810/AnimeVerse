/* api.js — Jikan API helper layer */

const API = "https://api.jikan.moe/v4";

/* Sanitize text for HTML */
function esc(s) {
    return String(s || "").replace(/[&<>"]/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"
    }[c]));
}

/* GENRES */
async function fetchGenres() {
    const res = await fetch(`${API}/genres/anime`);
    const json = await res.json();
    return json.data || [];
}

/* Get anime details */
async function fetchAnimeDetails(id) {
    const res = await fetch(`${API}/anime/${id}`);
    const json = await res.json();
    return json.data;
}

/* Basic info for favorites */
async function fetchAnimeBasic(id) {
    const res = await fetch(`${API}/anime/${id}`);
    const json = await res.json();
    return json.data;
}

/* Top anime by category: "bypopularity", "airing", "favorite", etc. */
async function fetchTopBy(type = "bypopularity", page = 1) {
    const res = await fetch(`${API}/top/anime?page=${page}&filter=${type}`);
    const json = await res.json();
    return json.data || [];
}

/* Anime by genre */
async function fetchAnimeByGenre(genreId, page = 1) {
    const res = await fetch(
        `${API}/anime?genres=${genreId}&order_by=score&sort=desc&page=${page}`
    );
    const json = await res.json();
    return json.data || [];
}

/* Search anime */
async function searchAnime(q) {
    if (!q.trim()) return [];
    const res = await fetch(`${API}/anime?q=${encodeURIComponent(q)}&limit=8`);
    const json = await res.json();
    return json.data || [];
}
