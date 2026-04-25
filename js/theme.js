/**
 * Theme Initialization
 * Sets initial theme on page load before main.js ThemeManager takes over
 */

(function() {
    const savedTheme = localStorage.getItem('nueera-theme');
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
})();
