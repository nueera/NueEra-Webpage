/**
 * NueEra - Enhanced Functionality & Performance
 * Forms, Animations, Mobile Fixes, Performance Optimizations
 * Version: 2.0
 */

// ==========================================
// ENHANCED FORM MANAGER
// Real-time validation, auto-save, character counter
// ==========================================

class EnhancedFormManager {
    constructor() {
        this.forms = document.querySelectorAll('form');
        this.autoSaveKey = 'nueera-form-draft';
        this.init();
    }

    init() {
        this.forms.forEach(form => {
            this.enhanceForm(form);
        });
    }

    enhanceForm(form) {
        const textareas = form.querySelectorAll('textarea');
        const inputs = form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]');
        
        // Add character counter to textareas
        textareas.forEach(textarea => {
            this.addCharacterCounter(textarea);
        });

        // Add floating label animation
        inputs.forEach(input => {
            this.addFloatingLabelEffect(input);
        });

        // Add auto-save functionality
        this.setupAutoSave(form);

        // Enhanced real-time validation
        this.setupRealTimeValidation(form);

        // Add honeypot spam protection
        this.addHoneypot(form);

        // Add form progress indicator
        this.addProgressIndicator(form);
    }

    addCharacterCounter(textarea) {
        const maxLength = textarea.getAttribute('maxlength') || 500;
        textarea.removeAttribute('maxlength');
        
        const counter = document.createElement('div');
        counter.className = 'char-counter';
        counter.innerHTML = `<span class="current">0</span>/<span class="max">${maxLength}</span>`;
        counter.style.cssText = `
            font-size: 0.75rem;
            color: var(--text-muted);
            text-align: right;
            margin-top: 4px;
            transition: color 0.3s ease;
        `;
        
        textarea.parentNode.appendChild(counter);
        
        const updateCounter = () => {
            const current = textarea.value.length;
            counter.querySelector('.current').textContent = current;
            
            if (current > maxLength * 0.9) {
                counter.style.color = '#ff6b6b';
            } else if (current > maxLength * 0.7) {
                counter.style.color = 'var(--accent-orange)';
            } else {
                counter.style.color = 'var(--text-muted)';
            }
            
            if (current > maxLength) {
                textarea.value = textarea.value.substring(0, maxLength);
                counter.querySelector('.current').textContent = maxLength;
            }
        };
        
        textarea.addEventListener('input', updateCounter);
        updateCounter();
    }

    addFloatingLabelEffect(input) {
        const formGroup = input.closest('.form-group');
        if (!formGroup) return;

        // Add focus/blur animations
        input.addEventListener('focus', () => {
            formGroup.classList.add('focused');
        });

        input.addEventListener('blur', () => {
            if (!input.value) {
                formGroup.classList.remove('focused');
            }
        });

        // Check initial state
        if (input.value) {
            formGroup.classList.add('focused');
        }
    }

    setupAutoSave(form) {
        const formId = form.id || 'contact-form';
        const saveKey = `${this.autoSaveKey}-${formId}`;
        
        // Load saved data
        const savedData = localStorage.getItem(saveKey);
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                Object.keys(data).forEach(key => {
                    const field = form.querySelector(`[name="${key}"]`);
                    if (field && field.type !== 'checkbox' && field.type !== 'hidden') {
                        field.value = data[key];
                        field.dispatchEvent(new Event('input'));
                    }
                });
                
                // Show restore notification
                this.showAutoSaveNotification(form);
            } catch (e) {
                console.warn('Could not restore form data');
            }
        }

        // Save on input
        let saveTimeout;
        const saveForm = () => {
            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => {
                if (key !== 'form-name' && key !== 'consent') {
                    data[key] = value;
                }
            });
            localStorage.setItem(saveKey, JSON.stringify(data));
        };

        form.addEventListener('input', () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(saveForm, 500);
        });

        // Clear saved data on successful submit
        form.addEventListener('submit', () => {
            localStorage.removeItem(saveKey);
        });
    }

    showAutoSaveNotification(form) {
        const notification = document.createElement('div');
        notification.className = 'autosave-notification';
        notification.innerHTML = `
            <i class="fas fa-history"></i>
            <span>Draft restored</span>
            <button type="button" class="clear-draft">Clear</button>
        `;
        notification.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: var(--bg-glass);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            font-size: 0.85rem;
            color: var(--text-secondary);
            margin-bottom: 1rem;
            animation: fadeIn 0.3s ease;
        `;
        
        const clearBtn = notification.querySelector('.clear-draft');
        clearBtn.style.cssText = `
            background: transparent;
            border: none;
            color: var(--accent-blue);
            cursor: pointer;
            font-weight: 600;
        `;
        
        clearBtn.addEventListener('click', () => {
            const formId = form.id || 'contact-form';
            localStorage.removeItem(`${this.autoSaveKey}-${formId}`);
            form.reset();
            notification.remove();
        });

        form.parentNode.insertBefore(notification, form);

        // Auto-hide after 5 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    setupRealTimeValidation(form) {
        const fields = form.querySelectorAll('input, textarea, select');
        
        fields.forEach(field => {
            // Validate on blur
            field.addEventListener('blur', () => {
                this.validateField(field);
            });

            // Revalidate on input if error exists
            field.addEventListener('input', () => {
                const formGroup = field.closest('.form-group');
                if (formGroup && formGroup.classList.contains('error')) {
                    this.validateField(field);
                }
            });
        });
    }

    validateField(field) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return true;

        const value = field.value.trim();
        const type = field.type;
        let error = '';

        // Remove existing error
        const existingError = formGroup.querySelector('.error-message');
        if (existingError) existingError.remove();
        formGroup.classList.remove('error', 'success');

        // Validation rules
        if (field.hasAttribute('required') && !value && type !== 'checkbox') {
            error = 'This field is required';
        } else if (type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                error = 'Please enter a valid email address';
            }
        } else if (type === 'tel' && value) {
            const phoneRegex = /^[\d\s\-+()]{8,}$/;
            if (!phoneRegex.test(value)) {
                error = 'Please enter a valid phone number';
            }
        }

        // Show error or success
        if (error) {
            formGroup.classList.add('error');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${error}`;
            errorDiv.style.cssText = `
                color: #ff6b6b;
                font-size: 0.8rem;
                margin-top: 4px;
                display: flex;
                align-items: center;
                gap: 4px;
            `;
            formGroup.appendChild(errorDiv);
            
            // Shake animation
            field.style.animation = 'shake 0.3s ease';
            setTimeout(() => field.style.animation = '', 300);
            
            return false;
        } else if (value) {
            formGroup.classList.add('success');
        }

        return true;
    }

    addHoneypot(form) {
        const honeypot = document.createElement('input');
        honeypot.type = 'text';
        honeypot.name = 'website';
        honeypot.className = 'honeypot-field';
        honeypot.style.cssText = `
            position: absolute;
            left: -9999px;
            width: 1px;
            height: 1px;
            opacity: 0;
            pointer-events: none;
        `;
        honeypot.tabIndex = -1;
        honeypot.autocomplete = 'off';
        form.appendChild(honeypot);
    }

    addProgressIndicator(form) {
        const requiredFields = form.querySelectorAll('[required]');
        if (requiredFields.length === 0) return;

        const progressBar = document.createElement('div');
        progressBar.className = 'form-progress';
        progressBar.innerHTML = `
            <div class="progress-bar" style="width: 0%"></div>
            <span class="progress-text">0% complete</span>
        `;
        progressBar.style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 1.5rem;
        `;

        const bar = progressBar.querySelector('.progress-bar');
        bar.style.cssText = `
            flex: 1;
            height: 4px;
            background: var(--border-color);
            border-radius: 2px;
            overflow: hidden;
        `;

        const innerBar = document.createElement('div');
        innerBar.className = 'progress-inner';
        innerBar.style.cssText = `
            height: 100%;
            background: linear-gradient(90deg, var(--accent-blue), var(--accent-orange));
            border-radius: 2px;
            transition: width 0.3s ease;
            width: 0%;
        `;
        bar.appendChild(innerBar);

        const text = progressBar.querySelector('.progress-text');
        text.style.cssText = `
            font-size: 0.8rem;
            color: var(--text-muted);
            min-width: 80px;
        `;

        form.parentNode.insertBefore(progressBar, form);

        // Update progress
        const updateProgress = () => {
            let filled = 0;
            requiredFields.forEach(field => {
                if (field.type === 'checkbox' && field.checked) filled++;
                else if (field.value.trim()) filled++;
            });
            
            const percent = Math.round((filled / requiredFields.length) * 100);
            innerBar.style.width = `${percent}%`;
            text.textContent = `${percent}% complete`;
            
            if (percent === 100) {
                text.textContent = 'Ready to submit!';
                text.style.color = 'var(--accent-blue)';
            } else {
                text.style.color = 'var(--text-muted)';
            }
        };

        form.addEventListener('input', updateProgress);
        updateProgress();
    }
}

// ==========================================
// ENHANCED ANIMATIONS & MICRO-INTERACTIONS
// ==========================================

class AnimationEnhancer {
    constructor() {
        this.prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!this.prefersReduced) {
            this.init();
        }
    }

    init() {
        this.addRippleEffect();
        this.addTiltEffect();
        this.addScrollRevealEnhancements();
        this.addCounterAnimations();
        this.addTypewriterEffect();
    }

    addRippleEffect() {
        const buttons = document.querySelectorAll('.btn');
        
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const rect = btn.getBoundingClientRect();
                const ripple = document.createElement('span');
                const size = Math.max(rect.width, rect.height);
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${e.clientX - rect.left - size/2}px;
                    top: ${e.clientY - rect.top - size/2}px;
                    background: rgba(255,255,255,0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s ease-out;
                    pointer-events: none;
                `;
                
                btn.style.position = 'relative';
                btn.style.overflow = 'hidden';
                btn.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 600);
            });
        });

        // Add ripple keyframes
        if (!document.getElementById('ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                @keyframes ripple {
                    to { transform: scale(4); opacity: 0; }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    addTiltEffect() {
        const cards = document.querySelectorAll('.service-card, .feature-card, .blog-card, .pricing-card');
        
        if (window.innerWidth < 1024) return; // Skip on mobile

        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    addScrollRevealEnhancements() {
        // Staggered reveal for grids
        const grids = document.querySelectorAll('.services-grid, .features-grid, .why-grid, .blog-grid');
        
        grids.forEach(grid => {
            const items = grid.children;
            Array.from(items).forEach((item, index) => {
                item.style.transitionDelay = `${index * 0.1}s`;
            });
        });

        // Parallax for hero elements
        const heroElements = document.querySelectorAll('.floating-card');
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            heroElements.forEach((el, index) => {
                const speed = 0.1 + (index * 0.05);
                el.style.transform = `translateY(${scrolled * speed}px)`;
            });
        }, { passive: true });
    }

    addCounterAnimations() {
        const counters = document.querySelectorAll('.metric-value, .stat-number');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    const text = target.textContent;
                    const num = parseInt(text.replace(/[^0-9]/g, ''));
                    const suffix = text.replace(/[0-9]/g, '');
                    
                    if (!isNaN(num)) {
                        this.animateCounter(target, 0, num, suffix, 1500);
                    }
                    observer.unobserve(target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => observer.observe(counter));
    }

    animateCounter(element, start, end, suffix, duration) {
        const startTime = performance.now();
        
        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.round(start + (end - start) * easeOutQuart);
            
            element.textContent = current + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };
        
        requestAnimationFrame(update);
    }

    addTypewriterEffect() {
        const elements = document.querySelectorAll('.typewriter');
        
        elements.forEach(el => {
            const text = el.textContent;
            el.textContent = '';
            el.style.borderRight = '2px solid var(--accent-blue)';
            
            let i = 0;
            const type = () => {
                if (i < text.length) {
                    el.textContent += text.charAt(i);
                    i++;
                    setTimeout(type, 50);
                } else {
                    el.style.borderRight = 'none';
                }
            };
            
            // Start when visible
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    type();
                    observer.disconnect();
                }
            });
            observer.observe(el);
        });
    }
}

// ==========================================
// MOBILE ENHANCEMENTS
// ==========================================

class MobileEnhancer {
    constructor() {
        this.isMobile = window.innerWidth <= 768;
        this.isTouch = 'ontouchstart' in window;
        this.init();
    }

    init() {
        this.fixViewportHeight();
        this.enhanceTouchTargets();
        this.addSwipeGestures();
        this.optimizeMobileNav();
        this.addPullToRefresh();
    }

    fixViewportHeight() {
        // Fix for mobile browser address bar
        const setVH = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        
        setVH();
        window.addEventListener('resize', debounce(setVH, 100));
    }

    enhanceTouchTargets() {
        // Ensure minimum 44px touch targets
        const interactiveElements = document.querySelectorAll('a, button, .btn, input, select, textarea');
        
        interactiveElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.height < 44 && this.isTouch) {
                el.style.minHeight = '44px';
                el.style.minWidth = '44px';
            }
        });
    }

    addSwipeGestures() {
        // Swipe to close mobile menu
        const mobileMenu = document.getElementById('mobileMenu');
        if (!mobileMenu) return;

        let touchStartX = 0;
        let touchEndX = 0;

        mobileMenu.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        mobileMenu.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            
            if (touchEndX - touchStartX > 100) {
                // Swipe right to close
                mobileMenu.classList.remove('open');
                document.documentElement.classList.remove('lock-scroll');
            }
        }, { passive: true });
    }

    optimizeMobileNav() {
        const navbar = document.querySelector('.navbar');
        let lastScrollY = window.scrollY;
        let scrollTimeout;

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            // Hide/show navbar on scroll
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
            
            lastScrollY = currentScrollY;
            
            // Add shadow when scrolled
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                if (currentScrollY > 10) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            }, 10);
        }, { passive: true });
    }

    addPullToRefresh() {
        if (!this.isMobile) return;
        
        let startY = 0;
        let currentY = 0;
        
        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].clientY;
            }
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (startY && window.scrollY === 0) {
                currentY = e.touches[0].clientY;
                const diff = currentY - startY;
                
                if (diff > 0 && diff < 150) {
                    document.body.style.transform = `translateY(${diff * 0.3}px)`;
                }
            }
        }, { passive: true });

        document.addEventListener('touchend', () => {
            if (currentY - startY > 100) {
                // Trigger refresh animation
                location.reload();
            }
            document.body.style.transform = '';
            startY = 0;
            currentY = 0;
        }, { passive: true });
    }
}

// ==========================================
// PERFORMANCE OPTIMIZER
// ==========================================

class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.lazyLoadImages();
        this.lazyLoadBackgrounds();
        this.preloadCriticalResources();
        this.optimizeAnimations();
        this.addResourceHints();
    }

    lazyLoadImages() {
        const images = document.querySelectorAll('img:not([loading])');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    
                    img.loading = 'lazy';
                    img.decoding = 'async';
                    
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px'
        });

        images.forEach(img => {
            if (!img.complete) {
                imageObserver.observe(img);
            }
        });
    }

    lazyLoadBackgrounds() {
        const bgElements = document.querySelectorAll('[data-bg]');
        
        const bgObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    el.style.backgroundImage = `url(${el.dataset.bg})`;
                    el.removeAttribute('data-bg');
                    bgObserver.unobserve(el);
                }
            });
        }, {
            rootMargin: '100px 0px'
        });

        bgElements.forEach(el => bgObserver.observe(el));
    }

    preloadCriticalResources() {
        // Preload hero image
        const heroBg = document.querySelector('.hero-background');
        if (heroBg && heroBg.style.backgroundImage) {
            const url = heroBg.style.backgroundImage.slice(5, -2);
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = url;
            document.head.appendChild(link);
        }
    }

    optimizeAnimations() {
        // Use will-change sparingly
        const animatedElements = document.querySelectorAll('.glow-orb, .floating-card, .hero-visual');
        
        animatedElements.forEach(el => {
            el.style.willChange = 'transform, opacity';
        });

        // Disable heavy animations on low-end devices
        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
            document.body.classList.add('reduce-animations');
        }
    }

    addResourceHints() {
        // DNS prefetch for external resources
        const externalDomains = [
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com',
            'https://cdnjs.cloudflare.com'
        ];

        externalDomains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'dns-prefetch';
            link.href = domain;
            document.head.appendChild(link);
        });
    }
}

// ==========================================
// LOADING STATES & SKELETON SCREENS
// ==========================================

class LoadingStateManager {
    constructor() {
        this.init();
    }

    init() {
        this.createSkeletonStyles();
        this.addPageTransition();
        this.enhancePageLoader();
    }

    createSkeletonStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .skeleton {
                background: linear-gradient(90deg, var(--bg-glass) 25%, var(--bg-tertiary) 50%, var(--bg-glass) 75%);
                background-size: 200% 100%;
                animation: skeleton-loading 1.5s ease-in-out infinite;
                border-radius: 8px;
            }
            
            @keyframes skeleton-loading {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
            
            .skeleton-text {
                height: 1em;
                margin-bottom: 0.5rem;
            }
            
            .skeleton-title {
                height: 2em;
                width: 60%;
                margin-bottom: 1rem;
            }
            
            .skeleton-image {
                height: 200px;
                width: 100%;
            }
            
            .skeleton-button {
                height: 48px;
                width: 150px;
            }
            
            /* Page transition */
            .page-transition {
                position: fixed;
                inset: 0;
                background: var(--bg-primary);
                z-index: 9999;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .page-transition.active {
                opacity: 1;
                pointer-events: all;
            }
        `;
        document.head.appendChild(style);
    }

    addPageTransition() {
        const transition = document.createElement('div');
        transition.className = 'page-transition';
        document.body.appendChild(transition);

        // Add transition on internal links
        document.querySelectorAll('a[href^="/"], a[href$=".html"]').forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.hostname === window.location.hostname) {
                    e.preventDefault();
                    transition.classList.add('active');
                    
                    setTimeout(() => {
                        window.location.href = link.href;
                    }, 300);
                }
            });
        });

        // Remove transition on page load
        window.addEventListener('pageshow', () => {
            transition.classList.remove('active');
        });
    }

    enhancePageLoader() {
        const loader = document.getElementById('page-loader');
        if (!loader) return;

        // Add progress to loader
        const progress = document.createElement('div');
        progress.className = 'loader-progress';
        progress.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            height: 3px;
            background: linear-gradient(90deg, var(--accent-blue), var(--accent-orange));
            width: 0%;
            transition: width 0.3s ease;
        `;
        loader.appendChild(progress);

        // Simulate loading progress
        let width = 0;
        const interval = setInterval(() => {
            width += Math.random() * 30;
            if (width > 90) width = 90;
            progress.style.width = `${width}%`;
        }, 100);

        // Complete on load
        window.addEventListener('load', () => {
            clearInterval(interval);
            progress.style.width = '100%';
            setTimeout(() => {
                loader.classList.add('hidden');
            }, 300);
        });
    }
}

// ==========================================
// SMOOTH SCROLL ENHANCEMENTS
// ==========================================

class SmoothScrollEnhancer {
    constructor() {
        this.init();
    }

    init() {
        // Enhanced smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#') return;
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    
                    const headerOffset = 100;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                    // Update URL without jumping
                    history.pushState(null, null, href);
                }
            });
        });

        // Scroll progress indicator
        this.addScrollProgress();
    }

    addScrollProgress() {
        const progressBar = document.querySelector('.scroll-progress-bar');
        if (!progressBar) return;

        window.addEventListener('scroll', () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            progressBar.style.width = scrolled + '%';
        }, { passive: true });
    }
}

// ==========================================
// ACCESSIBILITY ENHANCEMENTS
// ==========================================

class AccessibilityEnhancer {
    constructor() {
        this.init();
    }

    init() {
        this.enhanceFocusVisibility();
        this.addSkipLinks();
        this.improveKeyboardNav();
        this.addAriaLive();
    }

    enhanceFocusVisibility() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-nav');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-nav');
        });

        // Add focus styles
        const style = document.createElement('style');
        style.textContent = `
            body.keyboard-nav *:focus {
                outline: 3px solid var(--accent-blue) !important;
                outline-offset: 2px;
            }
        `;
        document.head.appendChild(style);
    }

    addSkipLinks() {
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) return; // Already exists

        const link = document.createElement('a');
        link.href = '#main';
        link.className = 'skip-link';
        link.textContent = 'Skip to main content';
        document.body.insertBefore(link, document.body.firstChild);
    }

    improveKeyboardNav() {
        // Escape key handlers
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Close mobile menu
                const mobileMenu = document.getElementById('mobileMenu');
                if (mobileMenu && mobileMenu.classList.contains('open')) {
                    mobileMenu.classList.remove('open');
                    document.documentElement.classList.remove('lock-scroll');
                }
                
                // Close any open modals
                const modals = document.querySelectorAll('.modal.open');
                modals.forEach(modal => modal.classList.remove('open'));
            }
        });
    }

    addAriaLive() {
        // Create live region for announcements
        const liveRegion = document.createElement('div');
        liveRegion.id = 'aria-live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.cssText = `
            position: absolute;
            left: -9999px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        document.body.appendChild(liveRegion);
    }

    announce(message) {
        const liveRegion = document.getElementById('aria-live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
        }
    }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

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

function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all enhancement modules
    new EnhancedFormManager();
    new AnimationEnhancer();
    new MobileEnhancer();
    new PerformanceOptimizer();
    new LoadingStateManager();
    new SmoothScrollEnhancer();
    new AccessibilityEnhancer();
    
    console.log('%c✨ NueEra Enhancements Loaded', 'color: #00a8ff; font-weight: bold;');
});

// Export for use in other modules
window.NueEraEnhancements = {
    EnhancedFormManager,
    AnimationEnhancer,
    MobileEnhancer,
    PerformanceOptimizer,
    LoadingStateManager,
    AccessibilityEnhancer
};
