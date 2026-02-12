// ==========================================
// NUEERA - PREMIUM JAVASCRIPT
// Theme Toggle, Navigation, Interactivity
// ==========================================

// ==========================================
// THEME MANAGEMENT
// ==========================================

class ThemeManager {
    constructor() {
        this.theme = this.getTheme();
        this.init();
    }

    getTheme() {
        // Check localStorage
        const stored = localStorage.getItem('nueera-theme');
        if (stored) return stored;

        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light'; // Default to light
    }

    setTheme(theme) {
        this.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('nueera-theme', theme);
        this.updateToggleButton();
    }

    toggle() {
        const newTheme = this.theme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    init() {
        document.documentElement.setAttribute('data-theme', this.theme);
        this.updateToggleButton();
        
        // Listen for theme toggle (all toggle buttons)
        const toggleBtns = document.querySelectorAll('.theme-toggle');
        toggleBtns.forEach(btn => btn.addEventListener('click', () => this.toggle()));

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (!localStorage.getItem('nueera-theme')) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    updateToggleButton() {
        const toggleBtns = document.querySelectorAll('.theme-toggle');
        const sunIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
        const moonIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
        
        const icon = this.theme === 'dark' ? sunIcon : moonIcon;
        toggleBtns.forEach(btn => { 
            btn.innerHTML = icon; 
            btn.setAttribute('aria-pressed', this.theme === 'dark' ? 'true' : 'false');
            btn.setAttribute('aria-label', this.theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
        });
    }
}

// Initialize theme manager
const themeManager = new ThemeManager();

// ==========================================
// NAVIGATION MANAGEMENT
// ==========================================

class NavigationManager {
    constructor() {
        this.mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        this.mobileMenu = document.getElementById('mobileMenu');
        this.mobileMenuClose = document.getElementById('mobileMenuClose');
        this.navLinks = document.querySelector('.nav-links');
        this.navItems = document.querySelectorAll('.nav-links a');
        this.mobileNavItems = document.querySelectorAll('.mobile-nav-links li');
        this.navbar = document.querySelector('.navbar');
        this.sections = Array.from(document.querySelectorAll('section'));
        this.sectionPositions = [];
        this.ticking = false;
        this.init();
    }

    init() {
        // Mobile menu toggle
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
        }
        if (this.mobileMenuClose) {
            this.mobileMenuClose.addEventListener('click', () => this.closeMobileMenu());
        }

        // Close on ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeMobileMenu();
        });

        // Close menu when mobile overlay and click outside inner
        document.addEventListener('click', (e) => {
            if (this.mobileMenu && this.mobileMenu.classList.contains('open')) {
                if (!e.target.closest('.mobile-menu-inner') && !e.target.closest('.mobile-menu-btn')) {
                    this.closeMobileMenu();
                }
            }
        });

        // Close menu when any primary link is clicked
        this.navItems.forEach(link => {
            link.addEventListener('click', () => this.closeMobileMenu());
        });

        // Cache section positions and update on resize/load
        this.cacheSectionPositions();
        window.addEventListener('resize', debounce(() => this.cacheSectionPositions(), 200));
        window.addEventListener('load', () => this.cacheSectionPositions());

        // Update active link on scroll and navbar appearance using rAF to avoid jank
        window.addEventListener('scroll', (e) => {
            if (!this.ticking) {
                window.requestAnimationFrame(() => {
                    this.updateActiveLink();
                    this.updateNavbarScrollState();
                    this.ticking = false;
                });
                this.ticking = true;
            }
        }, { passive: true });
        this.updateActiveLink();
        this.updateNavbarScrollState();
    }

    toggleMobileMenu() {
        if (!this.mobileMenu) return;
        const open = !this.mobileMenu.classList.contains('open');
        this.mobileMenu.classList.toggle('open', open);
        if (this.mobileMenuBtn) this.mobileMenuBtn.classList.toggle('open', open);
        if (this.mobileMenuBtn) this.mobileMenuBtn.setAttribute('aria-expanded', String(open));
        this.mobileMenu.setAttribute('aria-hidden', String(!open));
        document.documentElement.classList.toggle('lock-scroll', open);

        // Stagger mobile links
        if (open) {
            this.mobileNavItems.forEach((li, i) => {
                li.style.transitionDelay = `${i * 0.1}s`;
            });
        } else {
            this.mobileNavItems.forEach(li => li.style.transitionDelay = '0s');
        }
    }

    closeMobileMenu() {
        if (!this.mobileMenu) return;
        this.mobileMenu.classList.remove('open');
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.classList.remove('open');
            this.mobileMenuBtn.setAttribute('aria-expanded', 'false');
        }
        this.mobileMenu.setAttribute('aria-hidden', 'true');
        document.documentElement.classList.remove('lock-scroll');
        this.mobileNavItems.forEach(li => li.style.transitionDelay = '0s');
    }

    updateActiveLink() {
        const scrollPos = window.scrollY + 220; // offset
        let current = '';
        for (let i = 0; i < this.sectionPositions.length; i++) {
            const s = this.sectionPositions[i];
            if (scrollPos >= s.top) current = s.id;
        }

        this.navItems.forEach(link => {
            link.classList.toggle('active', (() => {
                const href = link.getAttribute('href') || '';
                if (!href) return false;
                if (href === '/' && !current) return true;
                return current && href.includes(current);
            })());
        });
    }

    cacheSectionPositions() {
        this.sectionPositions = this.sections.map(s => ({ id: s.getAttribute('id') || '', top: s.offsetTop }));
    }

    updateNavbarScrollState() {
        if (!this.navbar) return;
        const threshold = 48;
        if (window.scrollY > threshold) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }
    }
}

// Initialize navigation
new NavigationManager();

// ==========================================
// SMOOTH SCROLLING
// ==========================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ==========================================
// SCROLL ANIMATIONS
// ==========================================

class ScrollAnimations {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
        this.sectionObserverOptions = {
            threshold: 0.3,
            rootMargin: '0px 0px -70% 0px'
        };
        this.observer = new IntersectionObserver(
            (entries) => this.handleObserver(entries),
            this.observerOptions
        );
        this.sectionObserver = new IntersectionObserver(
            (entries) => this.handleSectionObserver(entries),
            this.sectionObserverOptions
        );
        this.prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.animatedSections = new Set();
        this.init();
    }

    init() {
        // Standard individual elements
        const elements = document.querySelectorAll(
            '.service-card, .why-item, .process-step, .blog-card, .pricing-card, .timeline-step, .reveal'
        );
        elements.forEach((el, i) => {
            el.classList.add('reveal');
            // Service cards and process steps will use staggered delays; others will be instant (delay 0)
            if (el.classList.contains('service-card')) {
                el.style.transitionDelay = `${i * 0.08}s`;
            }
            this.observer.observe(el);
        });

        // Section-based reveals (30% viewport) - apply site-wide
        const siteSections = document.querySelectorAll(
            'section.section, section[id], .stats-section, .hero, [data-animate-section]'
        );
        siteSections.forEach(section => {
            this.sectionObserver.observe(section);
        });

        // Stat cards - grouped reveal
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            this.observer.observe(card);
        });

        // Process steps: set bottom->up stagger within each steps list
        const processLists = document.querySelectorAll('.process-steps, .process-steps ol, ol.process-steps');
        processLists.forEach(list => {
            const steps = Array.from(list.querySelectorAll('.process-step'));
            const count = steps.length;
            steps.forEach((step, idx) => {
                // bottom to up: later steps (higher index) should animate first, so invert delay
                const revIndex = (count - 1 - idx);
                step.style.transitionDelay = `${revIndex * 0.08}s`;
            });
        });

        // If user prefers reduced motion, reveal immediately
        if (this.prefersReduced) {
            document.querySelectorAll('.reveal, .stat-card, #who-we-are .section-content, .stats-section, #vision-mission, #culture, #careers, .about-cta, .hero-title, .hero-subtitle, .hero-badge, .hero-buttons, .hero-stats')
                .forEach(el => {
                    el.classList.add('in-view');
                    this.animatedSections.add(el);
                });
            this.observer.disconnect();
            this.sectionObserver.disconnect();
        }

        // Page-load hero animation trigger (not scroll): add class to body to start animations
        // Use DOMContentLoaded to ensure DOM is ready; if already loaded, run immediately
        const startHero = () => {
            document.body.classList.add('hero-animated');
            // mark hero elements as animated so they don't get observed again
            const heroEls = document.querySelectorAll('.hero-title, .hero-subtitle, .hero-badge, .hero-buttons, .hero-stats');
            heroEls.forEach(el => this.animatedSections.add(el));
        };
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', startHero);
        } else {
            startHero();
        }
    }

    handleObserver(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !this.animatedSections.has(entry.target)) {
                // Special handling for timeline steps - stagger the animation
                if (entry.target.classList.contains('timeline-step')) {
                    const parent = entry.target.closest('.about-timeline-wrapper');
                    if (parent) {
                        const steps = Array.from(parent.querySelectorAll('.timeline-step'));
                        const index = steps.indexOf(entry.target);
                        setTimeout(() => {
                            entry.target.classList.add('in-view');
                            this.animatedSections.add(entry.target);
                        }, index * 80);
                    }
                } else {
                    entry.target.classList.add('in-view');
                    this.animatedSections.add(entry.target);
                }
                this.observer.unobserve(entry.target);
            }
        });
    }

    handleSectionObserver(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !this.animatedSections.has(entry.target)) {
                entry.target.classList.add('in-view');
                this.animatedSections.add(entry.target);
                // For stat blocks, reveal contained stat items together (site-wide selectors)
                const statsRoot = entry.target.closest('.stats-section') || (entry.target.classList.contains('stats-section') ? entry.target : null) ||
                    (entry.target.querySelector && (entry.target.querySelector('.stat-item') || entry.target.querySelector('.stat-number')) ? entry.target : null);
                if (statsRoot) {
                    const statItems = statsRoot.querySelectorAll('.stat-item, .stat-card, .stat-number');
                    statItems.forEach((card) => {
                        card.classList.add('in-view');
                        this.animatedSections.add(card);
                    });
                }

                this.sectionObserver.unobserve(entry.target);
            }
        });
    }
}

// Initialize scroll animations
new ScrollAnimations();

// ==========================================
// INTENT-BASED CTA MANAGER
// Changes CTA labels based on scroll depth to match user intent
// ==========================================
class IntentCTAManager {
    constructor() {
        this.ctaButtons = Array.from(document.querySelectorAll('.intent-cta .btn'));
        this.thresholds = { early: 0.15, mid: 0.5, end: 0.95 };
        this.prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.init();
    }

    init() {
        if (!this.ctaButtons.length) return;
        window.addEventListener('scroll', this.onScroll.bind(this), { passive: true });
        window.addEventListener('resize', debounce(() => this.onScroll(), 150));
        // initial set
        this.onScroll();
    }

    onScroll() {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? window.scrollY / docHeight : 0;
        let intent = 'early';
        if (pct >= this.thresholds.mid) intent = 'mid';
        if (pct >= this.thresholds.end) intent = 'end';

        this.ctaButtons.forEach(btn => {
            const parent = btn.closest('.intent-cta');
            const target = btn.getAttribute('data-intent') || parent && parent.querySelector('.btn').getAttribute('data-intent');
            // Determine label based on page intent (but allow explicit data-intent on element)
            let label = btn.querySelector('.cta-label');
            if (!label) label = btn;

            if (intent === 'early') {
                label.textContent = parent && parent.querySelector('[data-intent="early"] .cta-label') ? parent.querySelector('[data-intent="early"] .cta-label').textContent : 'Explore Our Services';
            } else if (intent === 'mid') {
                label.textContent = 'See How We Work';
            } else {
                label.textContent = 'Get a Free Strategy Call';
            }
        });
    }
}

// Initialize Intent CTA manager
new IntentCTAManager();

// ==========================================
// PROGRESSIVE DISCLOSURE: Learn more toggles
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const toggles = document.querySelectorAll('.learn-more');
    toggles.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const parent = e.target.closest('.service-card');
            if (!parent) return;
            const more = parent.querySelector('.more-info');
            const expanded = more.classList.toggle('open');
            btn.setAttribute('aria-expanded', String(expanded));
            more.setAttribute('aria-hidden', String(!expanded));
            btn.textContent = expanded ? 'Show less' : 'See more';
        });
    });
});

// ==========================================
// CONTACT FORM
// ==========================================

class FormManager {
    constructor() {
        this.forms = document.querySelectorAll('form');
        this.init();
    }

    init() {
        this.forms.forEach(form => {
            form.addEventListener('submit', (e) => this.handleSubmit(e, form));
        });
    }

    async handleSubmit(e, form) {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        try {
            // Simulate submission (replace with actual API endpoint)
            await this.submitForm(data);
            
            this.showMessage(form, 'success', 'Thank you! We\'ll be in touch within 24 hours.');
            form.reset();
            console.log('Form submitted:', data);
            
        } catch (error) {
            this.showMessage(form, 'error', 'Something went wrong. Please try again.');
            console.error('Form error:', error);
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    submitForm(data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(data);
            }, 1000);
        });
    }

    showMessage(form, type, text) {
        let messageDiv = form.querySelector('.form-message');
        
        if (!messageDiv) {
            messageDiv = document.createElement('div');
            messageDiv.className = 'form-message';
            form.appendChild(messageDiv);
        }

        messageDiv.textContent = text;
        messageDiv.className = `form-message form-${type}-message`;
        messageDiv.style.display = 'block';
        messageDiv.style.padding = '1rem';
        messageDiv.style.borderRadius = '8px';
        messageDiv.style.marginTop = '1rem';
        
        if (type === 'success') {
            messageDiv.style.background = 'rgba(0, 168, 255, 0.15)';
            messageDiv.style.border = '1px solid #00a8ff';
            messageDiv.style.color = '#00a8ff';
        } else {
            messageDiv.style.background = 'rgba(255, 100, 100, 0.15)';
            messageDiv.style.border = '1px solid #ff6464';
            messageDiv.style.color = '#ff6464';
        }

        // Auto-hide after 5 seconds
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}

// Initialize form manager
document.addEventListener('DOMContentLoaded', () => {
    new FormManager();
});

// ==========================================
// FAQ ACCORDION
// ==========================================

class FAQAccordion {
    constructor() {
        this.items = document.querySelectorAll('.faq-item');
        this.init();
    }

    init() {
        this.items.forEach(item => {
            const question = item.querySelector('.faq-question');
            if (question) {
                question.addEventListener('click', () => this.toggle(item));
            }
        });
    }

    toggle(item) {
        const isActive = item.classList.contains('active');
        
        // Close all items
        this.items.forEach(i => i.classList.remove('active'));
        
        // Open clicked item if it wasn't active
        if (!isActive) {
            item.classList.add('active');
        }
    }
}

// Initialize FAQ accordion
document.addEventListener('DOMContentLoaded', () => {
    new FAQAccordion();
});

// ==========================================
// PARALLAX EFFECT
// ==========================================

class ParallaxEffect {
    constructor() {
        this.elements = document.querySelectorAll('.glow-orb');
        this.heroBg = document.querySelector('.hero-bg-img');
        this.ticking = false;
        this.prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!this.prefersReduced) {
            window.addEventListener('scroll', () => this.onScroll(), { passive: true });
        }
    }

    onScroll() {
        if (!this.ticking) {
            window.requestAnimationFrame(() => this.update());
            this.ticking = true;
        }
    }

    update() {
        const scrolled = window.pageYOffset || document.documentElement.scrollTop;
        this.elements.forEach((element, index) => {
            const speed = 0.18 + (index * 0.08);
            element.style.transform = `translate3d(0, ${Math.round(scrolled * speed)}px, 0)`;
        });

        if (this.heroBg) {
            this.heroBg.style.transform = `translate3d(0, ${Math.round(scrolled * 0.4)}px, 0)`;
        }
        this.ticking = false;
    }
}

// Initialize parallax
new ParallaxEffect();

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

// Debounce helper
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Show toast notification
        const toast = document.createElement('div');
        toast.textContent = 'Copied to clipboard!';
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #00a8ff;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    });
}

// ==========================================
// PAGE LOAD ANIMATIONS
// ==========================================

const handlePageLoader = () => {
    // Handle Page Loader
    const loader = document.getElementById('page-loader');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('hidden');
            setTimeout(() => {
                loader.remove();
            }, 600);
        }, 500); // Minimum display time
    }
    document.body.style.opacity = '1';
};

if (document.readyState === 'complete') {
    handlePageLoader();
} else {
    window.addEventListener('load', handlePageLoader);
}

// Add console welcome message
console.log(
    '%cNueEra%c — A New Era of Digital Growth',
    'font-size: 24px; font-weight: bold; color: #00a8ff;',
    'font-size: 14px; color: #ff9500;'
);
console.log(
    '%cPremium Digital Solutions Platform',
    'color: #00a8ff; font-size: 12px; margin-top: 10px;'
);

// ==========================================
// SCROLL TO TOP BUTTON
// ==========================================

class ScrollTopButton {
    constructor() {
        this.createButton();
    }

    createButton() {
        const btn = document.createElement('button');
        btn.className = 'scroll-top-btn';
        btn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        btn.setAttribute('aria-label', 'Scroll to top');
        document.body.appendChild(btn);

        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        }, { passive: true });

        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => new ScrollTopButton());

// ==========================================
// SCROLL PROGRESS BAR
// ==========================================

class ScrollProgressBar {
    constructor() {
        this.init();
    }

    init() {
        const container = document.createElement('div');
        container.className = 'scroll-progress-container';
        
        const bar = document.createElement('div');
        bar.className = 'scroll-progress-bar';
        
        container.appendChild(bar);
        document.body.appendChild(container);

        window.addEventListener('scroll', () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            bar.style.width = scrolled + "%";
        }, { passive: true });
    }
}

document.addEventListener('DOMContentLoaded', () => new ScrollProgressBar());

// ==========================================
// PERFORMANCE OPTIMIZATION
// ==========================================

// Debounced resize handler
window.addEventListener('resize', debounce(() => {
    // Handle responsive breakpoint changes
    if (window.innerWidth > 768) {
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) navLinks.classList.remove('active');
    }
}, 150));

// ==========================================
// COOKIE CONSENT
// ==========================================

class CookieConsent {
    constructor() {
        this.consent = localStorage.getItem('nueera-cookie-consent');
        if (!this.consent) {
            this.init();
        }
    }

    init() {
        // Create banner
        const banner = document.createElement('div');
        banner.className = 'cookie-banner';
        banner.innerHTML = `
            <div class="cookie-content">
                <h3>🍪 Cookie Settings</h3>
                <p>We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.</p>
            </div>
            <div class="cookie-buttons">
                <button class="btn btn-ghost" id="declineCookies">Decline</button>
                <button class="btn btn-primary" id="acceptCookies">Accept All</button>
            </div>
        `;
        document.body.appendChild(banner);

        // Add event listeners
        document.getElementById('acceptCookies').addEventListener('click', () => this.accept(banner));
        document.getElementById('declineCookies').addEventListener('click', () => this.decline(banner));

        // Show with delay
        setTimeout(() => {
            banner.classList.add('visible');
        }, 1000);
    }

    accept(banner) {
        localStorage.setItem('nueera-cookie-consent', 'accepted');
        this.hide(banner);
    }

    decline(banner) {
        localStorage.setItem('nueera-cookie-consent', 'declined');
        this.hide(banner);
    }

    hide(banner) {
        banner.classList.remove('visible');
        setTimeout(() => {
            banner.remove();
        }, 500);
    }
}

document.addEventListener('DOMContentLoaded', () => new CookieConsent());

// ==========================================
// PORTFOLIO FILTER
// ==========================================

class PortfolioFilter {
    constructor() {
        this.filters = document.querySelectorAll('.filter-btn');
        this.items = document.querySelectorAll('.project-card');
        if (this.filters.length > 0) {
            this.init();
        }
    }

    init() {
        this.filters.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class
                this.filters.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.getAttribute('data-filter');
                this.filterItems(filter);
            });
        });
    }

    filterItems(filter) {
        this.items.forEach(item => {
            const category = item.getAttribute('data-category');
            if (filter === 'all' || category === filter) {
                item.style.display = 'block';
                // Small delay to allow display:block to apply before opacity transition
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1)';
                }, 10);
            } else {
                item.style.opacity = '0';
                item.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => new PortfolioFilter());

// ==========================================
// MAGNETIC INTERACTION (Desktop Only)
// ==========================================

class MagneticInteraction {
    constructor() {
        // Only enable on fine pointer devices (desktop)
        if (window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches) {
            this.buttons = document.querySelectorAll('.btn-primary');
            this.init();
        }
    }

    init() {
        this.buttons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                // Magnetic pull strength (0.3 = 30% of movement)
                btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0, 0)';
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => new MagneticInteraction());

// ==========================================
// SOUND MANAGER (Web Audio API)
// ==========================================

class SoundManager {
    constructor() {
        this.ctx = null;
        this.enabled = false;
        // Only enable on desktop/non-touch primarily
        this.isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        this.init();
    }

    init() {
        // Initialize AudioContext on first user interaction
        const enableAudio = () => {
            if (!this.ctx) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext) {
                    this.ctx = new AudioContext();
                    this.enabled = true;
                }
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            ['click', 'keydown', 'touchstart'].forEach(e => 
                window.removeEventListener(e, enableAudio)
            );
        };

        ['click', 'keydown', 'touchstart'].forEach(e => 
            window.addEventListener(e, enableAudio)
        );

        this.attachListeners();
    }

    attachListeners() {
        if (this.isTouch) return; // Skip hover sounds on touch devices

        const selectors = [
            'a', '.btn', 'button', '.slider-card', '.service-card', 
            '.blog-card', '.pricing-card', '.faq-question', '.social-icon',
            '.theme-toggle', '.project-card', '.team-card'
        ];
        
        const elements = document.querySelectorAll(selectors.join(','));
        elements.forEach(el => {
            el.addEventListener('mouseenter', () => this.playTone(800, 'sine', 0.02));
            el.addEventListener('mousedown', () => this.playTone(300, 'triangle', 0.05));
        });
    }

    playTone(freq, type, vol) {
        if (!this.enabled || !this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.05);

        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.start(now);
        osc.stop(now + 0.05);
    }
}

document.addEventListener('DOMContentLoaded', () => new SoundManager());

// ==========================================
// PARTICLE SYSTEM
// ==========================================

class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('hero-particles');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = window.innerWidth < 768 ? 40 : 80; // Increased count for side density
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (this.prefersReduced) return;

        this.lastScrollY = window.scrollY;

        this.init();
        this.animate();
        
        window.addEventListener('resize', debounce(() => this.resize(), 200));
    }

    init() {
        this.resize();
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(this.createParticle());
        }
    }

    resize() {
        if (!this.canvas.parentElement) return;
        this.width = this.canvas.parentElement.offsetWidth;
        this.height = this.canvas.parentElement.offsetHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    createParticle() {
        // Spawn particles on the sides (left 20% and right 20%) to frame the content
        let x;
        if (Math.random() > 0.5) {
            x = Math.random() * (this.width * 0.2);
        } else {
            x = this.width - (Math.random() * (this.width * 0.2));
        }

        return {
            x: x,
            y: Math.random() * this.height,
            vx: (Math.random() - 0.5) * 0.2, // Slow velocity
            vy: (Math.random() - 0.5) * 0.2,
            size: Math.random() * 2,
            alpha: Math.random() * 0.3 + 0.1 // Low opacity
        };
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - this.lastScrollY;
        this.lastScrollY = currentScrollY;

        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        const rgb = isLight ? '0, 0, 0' : '255, 255, 255';

        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            // Subtle parallax effect: move particles slightly based on scroll speed
            p.y += scrollDelta * 0.2;

            // Wrap around screen
            if (p.x < 0) p.x = this.width;
            if (p.x > this.width) p.x = 0;
            if (p.y < 0) p.y = this.height;
            if (p.y > this.height) p.y = 0;

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${rgb}, ${p.alpha})`;
            this.ctx.fill();
        });

        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => new ParticleSystem());

// ==========================================
// BREADCRUMB GENERATOR
// ==========================================

class BreadcrumbGenerator {
    constructor() {
        this.init();
    }

    init() {
        const pageHeader = document.querySelector('.page-header');
        // Only run on inner pages with a header
        if (!pageHeader) return;

        const container = pageHeader.querySelector('.container') || pageHeader;
        
        // Create breadcrumb structure
        const nav = document.createElement('nav');
        nav.className = 'breadcrumb-nav';
        nav.setAttribute('aria-label', 'Breadcrumb');

        const ol = document.createElement('ol');
        ol.className = 'breadcrumb';

        // Home link
        this.addItem(ol, 'Home', 'index.html');

        // Current page (from title)
        const pageTitle = document.title.split('-')[0].trim();
        this.addItem(ol, pageTitle, null, true);

        nav.appendChild(ol);
        
        // Insert at top of container
        container.insertBefore(nav, container.firstChild);
    }

    addItem(parent, text, href, isActive = false) {
        const li = document.createElement('li');
        li.className = `breadcrumb-item${isActive ? ' active' : ''}`;
        
        if (isActive) {
            li.setAttribute('aria-current', 'page');
            li.textContent = text;
        } else {
            li.innerHTML = `<a href="${href}">${text}</a><i class="fas fa-chevron-right breadcrumb-separator"></i>`;
        }
        parent.appendChild(li);
    }
}

document.addEventListener('DOMContentLoaded', () => new BreadcrumbGenerator());

// ==========================================
// SERVICE PAGE SCROLL SPY
// ==========================================

class ServiceScrollSpy {
    constructor() {
        this.navLinks = document.querySelectorAll('.service-nav-link');
        this.sections = [];
        this.ticking = false;
        // Offset: Sticky Header (72px) + Sticky Nav (~60px) + Buffer
        this.offset = 180; 
        
        if (this.navLinks.length > 0) {
            this.init();
        }
    }

    init() {
        // Cache sections
        this.navLinks.forEach(link => {
            const id = link.getAttribute('href');
            if (id && id.startsWith('#')) {
                const section = document.querySelector(id);
                if (section) {
                    this.sections.push({ id, element: section, link });
                }
            }
        });

        if (this.sections.length === 0) return;

        window.addEventListener('scroll', () => this.onScroll(), { passive: true });
        window.addEventListener('resize', debounce(() => this.onScroll(), 150));
        this.onScroll(); // Initial check
    }

    onScroll() {
        if (!this.ticking) {
            window.requestAnimationFrame(() => {
                this.updateActiveState();
                this.ticking = false;
            });
            this.ticking = true;
        }
    }

    updateActiveState() {
        const scrollPosition = window.scrollY + this.offset; 
        let currentSection = null;

        // Find the current section (last one that has been passed)
        for (const section of this.sections) {
            if (section.element.offsetTop <= scrollPosition) {
                currentSection = section;
            }
        }

        this.navLinks.forEach(link => link.classList.remove('active'));
        
        if (currentSection) {
            currentSection.link.classList.add('active');
            
            // Auto-scroll horizontal nav on mobile
            const nav = document.querySelector('.service-nav');
            if (nav && window.innerWidth < 768) {
                const navRect = nav.getBoundingClientRect();
                const linkRect = currentSection.link.getBoundingClientRect();
                
                if (linkRect.left < navRect.left || linkRect.right > navRect.right) {
                    currentSection.link.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => new ServiceScrollSpy());

// ==========================================
// EXPORT FOR EXTERNAL USE
// ==========================================

window.NueEra = {
    theme: themeManager,
    copyToClipboard: copyToClipboard
};
window.NueEra = {
    theme: themeManager,
    copyToClipboard: copyToClipboard
};

// Category Filter Manager - lightweight slide indicator for blog categories
class CategoryFilterManager {
    constructor() {
        this.container = document.querySelector('.category-filter .category-filter-inner');
        this.pills = Array.from(document.querySelectorAll('.category-filter .pill'));
        this.indicator = document.querySelector('.category-filter .pill-indicator');
        if (!this.container || !this.pills.length || !this.indicator) return;
        this.init();
        window.addEventListener('resize', () => this.positionIndicator());
    }

    init() {
        this.pills.forEach(p => p.addEventListener('click', (e) => this.onClick(e)));
        // initial position
        requestAnimationFrame(() => this.positionIndicator());
    }

    onClick(e) {
        const target = e.currentTarget;
        this.pills.forEach(p => p.classList.remove('active'));
        target.classList.add('active');
        this.positionIndicator();
        // optional: filter articles by data-cat if implemented
    }

    positionIndicator() {
        const active = this.pills.find(p => p.classList.contains('active')) || this.pills[0];
        if (!active) return;
        const containerRect = this.container.getBoundingClientRect();
        const pillRect = active.getBoundingClientRect();
        const left = pillRect.left - containerRect.left + 6; // account for inner padding
        const width = Math.max(56, pillRect.width + 4);
        this.indicator.style.transform = `translateX(${left}px)`;
        this.indicator.style.width = `${width}px`;
    }
}

document.addEventListener('DOMContentLoaded', () => new CategoryFilterManager());
