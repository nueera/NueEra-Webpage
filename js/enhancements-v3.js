/**
 * NueEra Enhancement Suite v3
 * Focus Trap, High Contrast, Bottom Nav, FAQ ARIA, Skeleton Loading, 
 * Team Card Keyboard, Analytics Fix, Loader Optimization
 */
(function() {
    'use strict';

    // ==========================================
    // FOCUS TRAP FOR MOBILE MENU
    // ==========================================
    class FocusTrap {
        constructor() {
            this.mobileMenu = document.getElementById('mobileMenu');
            this.lastFocusedElement = null;
            this.focusableSelectors = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
            this.init();
        }

        init() {
            if (!this.mobileMenu) return;
            
            // Watch for menu open/close
            const observer = new MutationObserver(() => {
                if (this.mobileMenu.classList.contains('open')) {
                    this.lastFocusedElement = document.activeElement;
                    this.trap();
                } else {
                    this.untrap();
                }
            });
            observer.observe(this.mobileMenu, { attributes: true, attributeFilter: ['class'] });

            // Trap Tab key inside mobile menu
            this.mobileMenu.addEventListener('keydown', (e) => {
                if (e.key !== 'Tab' || !this.mobileMenu.classList.contains('open')) return;
                
                const focusable = Array.from(this.mobileMenu.querySelectorAll(this.focusableSelectors));
                if (!focusable.length) return;

                const first = focusable[0];
                const last = focusable[focusable.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === first) {
                        e.preventDefault();
                        last.focus();
                    }
                } else {
                    if (document.activeElement === last) {
                        e.preventDefault();
                        first.focus();
                    }
                }
            });
        }

        trap() {
            const focusable = this.mobileMenu.querySelectorAll(this.focusableSelectors);
            if (focusable.length) {
                setTimeout(() => focusable[0].focus(), 100);
            }
        }

        untrap() {
            if (this.lastFocusedElement) {
                this.lastFocusedElement.focus();
            }
        }
    }

    // ==========================================
    // HIGH CONTRAST MODE TOGGLE
    // ==========================================
    class HighContrastMode {
        constructor() {
            this.storageKey = 'nueera-high-contrast';
            this.init();
        }

        init() {
            const saved = localStorage.getItem(this.storageKey) === 'true';
            if (saved) {
                document.documentElement.setAttribute('data-theme', 'high-contrast');
            }

            document.addEventListener('click', (e) => {
                const btn = e.target.closest('.high-contrast-toggle');
                if (!btn) return;
                e.preventDefault();
                this.toggle();
            });

            // Listen for theme changes to update state
            window.addEventListener('themeChanged', () => {
                // If theme changed away from high-contrast, clear HC storage
                const current = document.documentElement.getAttribute('data-theme');
                if (current !== 'high-contrast') {
                    localStorage.removeItem(this.storageKey);
                }
            });
        }

        toggle() {
            const current = document.documentElement.getAttribute('data-theme');
            const isHighContrast = current === 'high-contrast';
            
            if (isHighContrast) {
                // Restore previous theme
                const saved = localStorage.getItem('nueera-theme') || 'light';
                document.documentElement.setAttribute('data-theme', saved);
                localStorage.removeItem(this.storageKey);
            } else {
                // Save current theme and switch to high contrast
                localStorage.setItem('nueera-theme', current);
                document.documentElement.setAttribute('data-theme', 'high-contrast');
                localStorage.setItem(this.storageKey, 'true');
            }
            
            window.dispatchEvent(new CustomEvent('themeChanged'));
            
            // Announce to screen readers
            const isNow = document.documentElement.getAttribute('data-theme') === 'high-contrast';
            this.announce(isNow ? 'High contrast mode enabled' : 'High contrast mode disabled');
        }

        announce(message) {
            let live = document.getElementById('a11y-announcer');
            if (!live) {
                live = document.createElement('div');
                live.id = 'a11y-announcer';
                live.setAttribute('aria-live', 'polite');
                live.setAttribute('aria-atomic', 'true');
                live.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);clip-path:inset(50%)';
                document.body.appendChild(live);
            }
            live.textContent = message;
        }
    }

    // ==========================================
    // BOTTOM NAV ACTIVE STATE
    // ==========================================
    class BottomNavActive {
        constructor() {
            this.init();
        }

        init() {
            const nav = document.querySelector('.mobile-bottom-nav');
            if (!nav) return;

            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            const items = nav.querySelectorAll('.bottom-nav-item');
            
            items.forEach(item => {
                const page = item.getAttribute('data-page');
                if (!page) return;
                
                // Match by page name
                if (currentPage === page + '.html' || 
                    (currentPage === '' && page === 'index') ||
                    (currentPage === 'index.html' && page === 'index')) {
                    item.classList.add('active');
                    item.setAttribute('aria-current', 'page');
                }
            });
        }
    }

    // ==========================================
    // FAQ ARIA KEYBOARD SUPPORT
    // ==========================================
    class FAQKeyboardSupport {
        constructor() {
            this.init();
        }

        init() {
            document.addEventListener('keydown', (e) => {
                const question = e.target.closest('.faq-question');
                if (!question) return;
                
                // Enter or Space to toggle
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    question.click();
                }
            });

            // Update aria-expanded when FAQ items are toggled
            const observer = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        const item = mutation.target.closest('.faq-item');
                        const question = item ? item.querySelector('.faq-question') : null;
                        if (question && question.hasAttribute('aria-expanded')) {
                            const isActive = item.classList.contains('active');
                            question.setAttribute('aria-expanded', String(isActive));
                        }
                    }
                });
            });

            document.querySelectorAll('.faq-item').forEach(item => {
                observer.observe(item, { attributes: true, attributeFilter: ['class'] });
            });
        }
    }

    // ==========================================
    // SKELETON LOADING
    // ==========================================
    class SkeletonLoader {
        constructor() {
            this.init();
        }

        init() {
            // Add skeleton class to images that haven't loaded yet
            document.querySelectorAll('img[loading="lazy"]').forEach(img => {
                if (!img.complete) {
                    const wrapper = img.parentElement;
                    if (wrapper && !wrapper.querySelector('.skeleton')) {
                        const skeleton = document.createElement('div');
                        skeleton.className = 'skeleton skeleton-card';
                        skeleton.style.position = 'absolute';
                        skeleton.style.top = '0';
                        skeleton.style.left = '0';
                        skeleton.style.right = '0';
                        skeleton.style.bottom = '0';
                        
                        if (getComputedStyle(wrapper).position === 'static') {
                            wrapper.style.position = 'relative';
                        }
                        wrapper.appendChild(skeleton);
                        
                        img.addEventListener('load', () => skeleton.remove());
                        img.addEventListener('error', () => skeleton.remove());
                    }
                }
            });
        }
    }

    // ==========================================
    // TEAM CARD KEYBOARD INTERACTION
    // ==========================================
    class TeamCardKeyboard {
        constructor() {
            this.init();
        }

        init() {
            document.querySelectorAll('.team-card[tabindex="0"]').forEach(card => {
                card.setAttribute('role', 'article');
                
                card.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        // Toggle expanded state or show details
                        card.classList.toggle('keyboard-focused');
                        
                        // If there's a social links overlay, toggle it
                        const socials = card.querySelector('.team-socials, .social-links');
                        if (socials) {
                            const expanded = socials.classList.toggle('visible');
                            card.setAttribute('aria-expanded', String(expanded));
                        }
                    }
                });

                card.addEventListener('focus', () => {
                    card.classList.add('keyboard-focused');
                });

                card.addEventListener('blur', () => {
                    card.classList.remove('keyboard-focused');
                });
            });
        }
    }

    // ==========================================
    // BLOG CATEGORY FILTER ARIA FIX
    // ==========================================
    class BlogFilterARIA {
        constructor() {
            this.init();
        }

        init() {
            const filterBtns = document.querySelectorAll('.filter-btn[role="tab"]');
            if (!filterBtns.length) return;

            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    // Update aria-selected on all tabs
                    filterBtns.forEach(b => b.setAttribute('aria-selected', 'false'));
                    btn.setAttribute('aria-selected', 'true');
                });
            });
        }
    }

    // ==========================================
    // INITIALIZE ALL
    // ==========================================
    document.addEventListener('DOMContentLoaded', () => {
        new FocusTrap();
        new HighContrastMode();
        new BottomNavActive();
        new FAQKeyboardSupport();
        new SkeletonLoader();
        new TeamCardKeyboard();
        new BlogFilterARIA();
    });

})();
