/* theme.js – AnimeVerse Smart Theme Engine */

/* 1. Load saved theme or system theme */
(function () {
    const saved = localStorage.getItem("animeverse-theme");

    if (saved) {
        document.documentElement.setAttribute("data-theme", saved);
        return;
    }

    /* If no saved theme, follow system preference */
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    document.documentElement.setAttribute("data-theme", prefersLight ? "light" : "dark");
})();

/* 2. Toggle and save theme */
function animeverseToggleTheme() {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "light" ? "dark" : "light";

    /* Smooth theme transition */
    document.documentElement.style.transition = "background 0.25s, color 0.25s";

    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("animeverse-theme", next);

    /* Remove transition after animation */
    setTimeout(() => {
        document.documentElement.style.transition = "";
    }, 300);
}
