document.addEventListener('DOMContentLoaded', function() {
    // Calculate reading time for the blog detail page
    const content = document.querySelector('.blog-post-content');
    const timeDisplay = document.getElementById('reading-time');

    if (content && timeDisplay) {
        const text = content.innerText || content.textContent || '';
        const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
        const readingSpeed = 225; // Average wpm
        const minutes = Math.max(1, Math.ceil(wordCount / readingSpeed));
        timeDisplay.innerText = `${minutes} min read`;
    }

    // Respect motion preference: ensure minimal animations
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
        document.querySelectorAll('.article-title, .article-deck, .article-meta, .article-micro').forEach(el => {
            el.style.transition = 'none';
        });
    }
});
document.addEventListener('DOMContentLoaded', function() {
    // Calculate reading time for the blog detail page
    const content = document.querySelector('.blog-post-content');
    const timeDisplay = document.getElementById('reading-time');

    if (content && timeDisplay) {
        const text = content.innerText || content.textContent;
        const wordCount = text.trim().split(/\s+/).length;
        const readingSpeed = 225; // Average reading speed (words per minute)
        const minutes = Math.ceil(wordCount / readingSpeed);
        
        timeDisplay.innerText = `${minutes} min read`;
    }
});