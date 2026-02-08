/**
 * Theme Switcher Logic
 * Handles toggling between Dark and Light modes using data-theme attribute
 */

document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.querySelector('.theme-toggle');
    const html = document.documentElement;
    
    // SVG Icons
    const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
    const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

    // Function to update theme
    const updateTheme = (theme) => {
        // always set the attribute explicitly so CSS [data-theme="dark"] works
        html.setAttribute('data-theme', theme);
        if (theme === 'light') {
            if (toggleButton) toggleButton.innerHTML = moonIcon;
        } else {
            if (toggleButton) toggleButton.innerHTML = sunIcon;
        }
        localStorage.setItem('theme', theme);
    };

    // Initialize
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    
    if (savedTheme) {
        updateTheme(savedTheme);
    } else {
        updateTheme(systemPrefersLight ? 'light' : 'dark');
    }

    // Event Listener
    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
            updateTheme(currentTheme === 'light' ? 'dark' : 'light');
        });
    }
});