document.addEventListener('DOMContentLoaded', function() {
    // Calculate reading time for the blog detail page
    const content = document.querySelector('.blog-post-content');
    const timeDisplay = document.getElementById('reading-time');
    const timeDisplaySecondary = document.getElementById('reading-time-2');

    if (content && timeDisplay) {
        const text = content.innerText || content.textContent || '';
        const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
        const readingSpeed = 225; // Average wpm
        const minutes = Math.max(1, Math.ceil(wordCount / readingSpeed));
        const readingText = `${minutes} min read`;
        timeDisplay.innerText = readingText;
        if (timeDisplaySecondary) {
            timeDisplaySecondary.innerText = readingText;
        }
    }

    // Respect motion preference: ensure minimal animations
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
        document.querySelectorAll('.article-title, .article-deck, .article-meta, .article-micro, .data-orbit-stage, .orbit-ring, .orbit-node').forEach(el => {
            el.style.transition = 'none';
            el.style.animation = 'none';
        });
    }
});
