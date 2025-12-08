/* theme.js */

(function () {
    const saved = localStorage.getItem("animeverse-theme");
    if (saved) {
        document.documentElement.setAttribute("data-theme", saved);
    }
})();

function animeverseToggleTheme() {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("animeverse-theme", next);
}
