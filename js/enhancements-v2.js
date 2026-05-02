/**
 * NueEra - Enhancements V2
 * Advanced Design, Mobile, Performance, Accessibility & Feature Enhancements
 * Loaded after main.js and enhancements.js — extends without duplicating
 * Version: 3.0
 */

(function () {
    'use strict';

    // ==========================================
    // GLOBAL UTILITIES
    // ==========================================

    /** Check reduced-motion preference once */
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /** Debounce — local copy so we don't depend on main.js load order */
    function debounceLocal(fn, wait) {
        var t;
        return function () {
            var a = arguments, ctx = this;
            clearTimeout(t);
            t = setTimeout(function () { fn.apply(ctx, a); }, wait);
        };
    }

    /** Throttle — local copy */
    function throttleLocal(fn, limit) {
        var inThrottle;
        return function () {
            var a = arguments, ctx = this;
            if (!inThrottle) {
                fn.apply(ctx, a);
                inThrottle = true;
                setTimeout(function () { inThrottle = false; }, limit);
            }
        };
    }

    /** Safe haptic feedback */
    function haptic(ms) {
        try {
            if (navigator.vibrate) navigator.vibrate(ms || 10);
        } catch (_) { /* unsupported */ }
    }

    /** Inject a <style> block with id guard */
    function injectStyles(id, css) {
        if (document.getElementById(id)) return;
        var s = document.createElement('style');
        s.id = id;
        s.textContent = css;
        document.head.appendChild(s);
    }

    /** Is desktop (width > 1024 and fine pointer)? */
    function isDesktop() {
        return window.innerWidth > 1024 && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    }

    /** Is mobile width? */
    function isMobileWidth() {
        return window.innerWidth <= 768;
    }

    // ==========================================
    // 1. DESIGN & VISUAL ENHANCEMENTS
    // ==========================================

    // ------------------------------------------
    // 1A. Enhanced Page Transitions
    // Extends the basic transition from enhancements.js
    // with slide + fade combo and pageshow cleanup
    // ------------------------------------------
    var PageTransitionEnhancer = (function () {
        function PageTransitionEnhancer() {
            this.transitionDiv = null;
            this.init();
        }

        PageTransitionEnhancer.prototype.init = function () {
            // Reuse existing .page-transition if enhancements.js already created one
            this.transitionDiv = document.querySelector('.page-transition');

            if (!this.transitionDiv) {
                // Create it ourselves
                this.transitionDiv = document.createElement('div');
                this.transitionDiv.className = 'page-transition';
                document.body.appendChild(this.transitionDiv);
            }

            // Inject enhanced transition styles
            injectStyles('v2-page-transition-styles', [
                '.page-transition {',
                '  position: fixed; inset: 0;',
                '  background: var(--bg-primary, #fff);',
                '  z-index: 9999;',
                '  pointer-events: none;',
                '  opacity: 0;',
                '  transform: translateY(0);',
                '  transition: opacity 0.3s ease, transform 0.3s ease;',
                '}',
                '.page-transition.active {',
                '  opacity: 1;',
                '  pointer-events: all;',
                '  transform: translateY(-10px);',
                '}'
            ].join('\n'));

            this.interceptLinks();

            // Remove "active" on pageshow (back-forward cache)
            window.addEventListener('pageshow', function () {
                if (this.transitionDiv) {
                    this.transitionDiv.classList.remove('active');
                }
            }.bind(this));
        };

        PageTransitionEnhancer.prototype.interceptLinks = function () {
            var self = this;

            document.addEventListener('click', function (e) {
                // Find closest anchor
                var link = e.target.closest('a[href$=".html"], a[href^="/"]');
                if (!link) return;

                // Skip external links, hash-only, target="_blank", modifier keys
                if (link.hostname && link.hostname !== window.location.hostname) return;
                if (link.target === '_blank') return;
                if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
                if (link.getAttribute('href') === '#') return;

                e.preventDefault();
                self.transitionDiv.classList.add('active');

                setTimeout(function () {
                    window.location.href = link.href;
                }, 300);
            });
        };

        return PageTransitionEnhancer;
    })();

    // ------------------------------------------
    // 1B. Scroll-Triggered Counter Animations (Enhanced)
    // Extends the basic counter from enhancements.js
    // with prefix/suffix support and better parsing
    // ------------------------------------------
    var EnhancedCounterAnimations = (function () {
        function EnhancedCounterAnimations() {
            if (prefersReducedMotion) return;
            this.animated = new WeakSet();
            this.init();
        }

        EnhancedCounterAnimations.prototype.init = function () {
            var self = this;
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting && !self.animated.has(entry.target)) {
                        self.animateElement(entry.target);
                        self.animated.add(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            document.querySelectorAll('.stat-number, .metric-value').forEach(function (el) {
                observer.observe(el);
            });
        };

        EnhancedCounterAnimations.prototype.parseNumber = function (text) {
            var result = { prefix: '', number: 0, suffix: '', decimals: 0 };
            var trimmed = text.trim();

            // Extract prefix (non-numeric start)
            var match = trimmed.match(/^([^0-9]*)([0-9]+(?:\.[0-9]+)?)(.*)$/);
            if (!match) return result;

            result.prefix = match[1] || '';
            var numStr = match[2];
            result.suffix = match[3] || '';

            if (numStr.indexOf('.') !== -1) {
                result.decimals = numStr.split('.')[1].length;
            }
            result.number = parseFloat(numStr);

            return result;
        };

        EnhancedCounterAnimations.prototype.animateElement = function (el) {
            var parsed = this.parseNumber(el.textContent);
            if (parsed.number === 0 && !parsed.suffix) return;

            var startTime = performance.now();
            var duration = 1500;
            var self = this;

            function update(currentTime) {
                var elapsed = currentTime - startTime;
                var progress = Math.min(elapsed / duration, 1);

                // easeOutQuart
                var eased = 1 - Math.pow(1 - progress, 4);
                var current = parsed.number * eased;

                var display;
                if (parsed.decimals > 0) {
                    display = current.toFixed(parsed.decimals);
                } else {
                    display = Math.round(current);
                }

                el.textContent = parsed.prefix + display + parsed.suffix;

                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    // Ensure final value is exact
                    el.textContent = parsed.prefix + (parsed.decimals > 0 ? parsed.number.toFixed(parsed.decimals) : parsed.number) + parsed.suffix;
                }
            }

            requestAnimationFrame(update);
        };

        return EnhancedCounterAnimations;
    })();

    // ------------------------------------------
    // 1C. Parallax Team Cards
    // Desktop-only subtle depth/tilt on hover
    // ------------------------------------------
    var ParallaxTeamCards = (function () {
        function ParallaxTeamCards() {
            if (prefersReducedMotion) return;
            if (!isDesktop()) return;
            this.cards = [];
            this.init();
        }

        ParallaxTeamCards.prototype.init = function () {
            var self = this;
            document.querySelectorAll('.team-card').forEach(function (card) {
                self.cards.push(card);
                card.addEventListener('mousemove', function (e) {
                    self.onMouseMove(card, e);
                });
                card.addEventListener('mouseleave', function () {
                    self.onMouseLeave(card);
                });
            });
        };

        ParallaxTeamCards.prototype.onMouseMove = function (card, e) {
            var rect = card.getBoundingClientRect();
            var centerX = rect.left + rect.width / 2;
            var centerY = rect.top + rect.height / 2;
            var mouseX = e.clientX;
            var mouseY = e.clientY;

            // Max tilt ±8deg
            var rotateY = ((mouseX - centerX) / (rect.width / 2)) * 8;
            var rotateX = -((mouseY - centerY) / (rect.height / 2)) * 8;

            rotateX = Math.max(-8, Math.min(8, rotateX));
            rotateY = Math.max(-8, Math.min(8, rotateY));

            card.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateZ(10px)';
            card.style.transition = 'transform 0.1s ease-out';
        };

        ParallaxTeamCards.prototype.onMouseLeave = function (card) {
            card.style.transform = '';
            card.style.transition = 'transform 0.4s ease-out';
        };

        return ParallaxTeamCards;
    })();

    // ------------------------------------------
    // 1D. Micro-Interactions
    // Icon bounce, extended card tilt, btn focus bounce
    // (Ripple already in enhancements.js — NOT duplicated)
    // ------------------------------------------
    var MicroInteractions = (function () {
        function MicroInteractions() {
            if (prefersReducedMotion) return;
            this.init();
        }

        MicroInteractions.prototype.init = function () {
            this.addIconBounce();
            this.extendCardTilt();
            this.addBtnFocusBounce();
        };

        MicroInteractions.prototype.addIconBounce = function () {
            // Icon bounce on hover for .why-icon and .feature-icon
            injectStyles('v2-icon-bounce', [
                '.why-icon, .feature-icon { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }',
                '.why-icon:hover, .feature-icon:hover, .icon-bounce { transform: scale(1.15) translateY(-3px); }'
            ].join('\n'));

            document.querySelectorAll('.why-icon, .feature-icon').forEach(function (icon) {
                icon.addEventListener('mouseenter', function () {
                    icon.classList.add('icon-bounce');
                });
                icon.addEventListener('mouseleave', function () {
                    icon.classList.remove('icon-bounce');
                });
            });
        };

        MicroInteractions.prototype.extendCardTilt = function () {
            // Extend tilt to .team-card, .testimonial-card, .pricing-card
            // (enhancements.js already handles .service-card, .feature-card, .blog-card)
            if (!isDesktop()) return;

            var cards = document.querySelectorAll('.team-card, .testimonial-card, .pricing-card');
            // Avoid re-binding cards that already have tilt from enhancements.js
            var alreadyTilted = new Set();

            cards.forEach(function (card) {
                // Simple check: if card already has a mousemove listener that sets transform
                // we skip — but we can't easily detect this, so we add a data attribute
                if (card.dataset.v2Tilt) return;
                card.dataset.v2Tilt = 'true';

                card.addEventListener('mousemove', function (e) {
                    var rect = card.getBoundingClientRect();
                    var x = e.clientX - rect.left;
                    var y = e.clientY - rect.top;
                    var centerX = rect.width / 2;
                    var centerY = rect.height / 2;
                    var rotateX = (y - centerY) / 20;
                    var rotateY = (centerX - x) / 20;
                    card.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateZ(10px)';
                });

                card.addEventListener('mouseleave', function () {
                    card.style.transform = '';
                });
            });
        };

        MicroInteractions.prototype.addBtnFocusBounce = function () {
            // Subtle scale bounce on .btn focus
            injectStyles('v2-btn-focus-bounce', [
                '.btn:focus-visible {',
                '  animation: btnFocusBounce 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);',
                '}',
                '@keyframes btnFocusBounce {',
                '  0% { transform: scale(1); }',
                '  50% { transform: scale(1.05); }',
                '  100% { transform: scale(1); }',
                '}'
            ].join('\n'));
        };

        return MicroInteractions;
    })();

    // ------------------------------------------
    // 1E. Dark Mode Hero Imagery
    // Sets data-hero-theme attribute on .hero
    // when theme changes
    // ------------------------------------------
    var DarkModeHeroImagery = (function () {
        function DarkModeHeroImagery() {
            this.init();
        }

        DarkModeHeroImagery.prototype.init = function () {
            var self = this;
            this.updateHeroTheme();

            window.addEventListener('themeChanged', function () {
                self.updateHeroTheme();
            });
        };

        DarkModeHeroImagery.prototype.updateHeroTheme = function () {
            var currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            document.querySelectorAll('.hero').forEach(function (hero) {
                hero.setAttribute('data-hero-theme', currentTheme);
            });
        };

        return DarkModeHeroImagery;
    })();

    // ------------------------------------------
    // 1F. Skeleton Loading States (Extended)
    // Adds skeleton placeholders for .blog-card,
    // .service-card, .team-card images with shimmer
    // ------------------------------------------
    var SkeletonLoadingExtension = (function () {
        function SkeletonLoadingExtension() {
            this.init();
        }

        SkeletonLoadingExtension.prototype.init = function () {
            var self = this;

            injectStyles('v2-skeleton-styles', [
                '.v2-skeleton-img {',
                '  background: linear-gradient(90deg, var(--bg-glass, #f0f0f0) 25%, var(--bg-tertiary, #e0e0e0) 50%, var(--bg-glass, #f0f0f0) 75%);',
                '  background-size: 200% 100%;',
                '  animation: v2-skeleton-shimmer 1.5s ease-in-out infinite;',
                '  border-radius: 8px;',
                '  position: absolute; inset: 0;',
                '  z-index: 1;',
                '}',
                '.v2-skeleton-wrap { position: relative; overflow: hidden; }',
                '.v2-skeleton-wrap .v2-skeleton-img { display: block; }',
                '.v2-skeleton-wrap.v2-loaded .v2-skeleton-img { opacity: 0; pointer-events: none; transition: opacity 0.3s ease; }',
                '@keyframes v2-skeleton-shimmer {',
                '  0% { background-position: 200% 0; }',
                '  100% { background-position: -200% 0; }',
                '}'
            ].join('\n'));

            var cardSelectors = '.blog-card, .service-card, .team-card';
            document.querySelectorAll(cardSelectors).forEach(function (card) {
                var img = card.querySelector('img');
                if (!img) return;

                // Wrap image container
                var parent = img.parentElement;
                if (parent.classList.contains('v2-skeleton-wrap')) return;

                // Create skeleton wrapper
                var wrapper = document.createElement('div');
                wrapper.className = 'v2-skeleton-wrap';
                wrapper.style.position = 'relative';
                wrapper.style.overflow = 'hidden';

                // Set dimensions based on image
                if (!img.complete) {
                    var skeleton = document.createElement('div');
                    skeleton.className = 'v2-skeleton-img';
                    skeleton.style.height = '200px';
                    skeleton.style.width = '100%';

                    parent.insertBefore(wrapper, img);
                    wrapper.appendChild(skeleton);
                    wrapper.appendChild(img);

                    img.addEventListener('load', function () {
                        wrapper.classList.add('v2-loaded');
                    });
                    img.addEventListener('error', function () {
                        wrapper.classList.add('v2-loaded');
                    });
                }
            });
        };

        return SkeletonLoadingExtension;
    })();

    // ------------------------------------------
    // 1G. Gradient Border Cards
    // Animated gradient border on hover for
    // .service-card and .feature-card
    // ------------------------------------------
    var GradientBorderCards = (function () {
        function GradientBorderCards() {
            if (prefersReducedMotion) return;
            this.init();
        }

        GradientBorderCards.prototype.init = function () {
            var self = this;

            injectStyles('v2-gradient-border', [
                '.service-card, .feature-card {',
                '  --gradient-angle: 0deg;',
                '  position: relative;',
                '}',
                '.service-card::before, .feature-card::before {',
                '  content: "";',
                '  position: absolute; inset: -2px;',
                '  border-radius: inherit;',
                '  background: conic-gradient(from var(--gradient-angle), var(--accent-blue, #00a8ff), var(--accent-orange, #ff6b35), var(--accent-blue, #00a8ff));',
                '  opacity: 0;',
                '  transition: opacity 0.3s ease;',
                '  z-index: -1;',
                '}',
                '.service-card:hover::before, .feature-card:hover::before {',
                '  opacity: 1;',
                '}',
                '.service-card::after, .feature-card::after {',
                '  content: "";',
                '  position: absolute; inset: 0;',
                '  border-radius: inherit;',
                '  background: var(--bg-primary, #fff);',
                '  z-index: -1;',
                '}'
            ].join('\n'));

            document.querySelectorAll('.service-card, .feature-card').forEach(function (card) {
                card.addEventListener('mouseenter', function () {
                    self.animateGradient(card);
                });
                card.addEventListener('mouseleave', function () {
                    card._gradientAnimating = false;
                    card.style.removeProperty('--gradient-angle');
                });
            });
        };

        GradientBorderCards.prototype.animateGradient = function (card) {
            card._gradientAnimating = true;
            var angle = 0;
            var self = this;

            function step() {
                if (!card._gradientAnimating) return;
                angle = (angle + 2) % 360;
                card.style.setProperty('--gradient-angle', angle + 'deg');
                requestAnimationFrame(step);
            }

            requestAnimationFrame(step);
        };

        return GradientBorderCards;
    })();

    // ------------------------------------------
    // 1H. Custom Cursor Effects
    // Desktop-only magnetic cursor near .btn-primary
    // ------------------------------------------
    var CustomCursorEffects = (function () {
        function CustomCursorEffects() {
            if (prefersReducedMotion) return;
            if (!isDesktop()) return;
            this.cursor = null;
            this.mouseX = 0;
            this.mouseY = 0;
            this.cursorX = 0;
            this.cursorY = 0;
            this.isNearCTA = false;
            this.rafId = null;
            this.init();
        }

        CustomCursorEffects.prototype.init = function () {
            var self = this;

            injectStyles('v2-custom-cursor', [
                '.v2-custom-cursor {',
                '  position: fixed; top: 0; left: 0;',
                '  width: 12px; height: 12px;',
                '  border-radius: 50%;',
                '  background: var(--accent-blue, #00a8ff);',
                '  pointer-events: none;',
                '  z-index: 99999;',
                '  opacity: 0.6;',
                '  transition: width 0.25s ease, height 0.25s ease, opacity 0.25s ease, background 0.25s ease;',
                '  transform: translate(-50%, -50%);',
                '  mix-blend-mode: difference;',
                '}',
                '.v2-custom-cursor.near-cta {',
                '  width: 40px; height: 40px;',
                '  opacity: 0.3;',
                '  background: var(--accent-orange, #ff6b35);',
                '}'
            ].join('\n'));

            this.cursor = document.createElement('div');
            this.cursor.className = 'v2-custom-cursor';
            this.cursor.setAttribute('aria-hidden', 'true');
            document.body.appendChild(this.cursor);

            document.addEventListener('mousemove', function (e) {
                self.mouseX = e.clientX;
                self.mouseY = e.clientY;
                self.checkCTAProximity(e.clientX, e.clientY);
            }, { passive: true });

            this.animate();
        };

        CustomCursorEffects.prototype.checkCTAProximity = function (mx, my) {
            var ctaButtons = document.querySelectorAll('.btn-primary');
            var near = false;

            for (var i = 0; i < ctaButtons.length; i++) {
                var rect = ctaButtons[i].getBoundingClientRect();
                var cx = rect.left + rect.width / 2;
                var cy = rect.top + rect.height / 2;
                var dist = Math.sqrt(Math.pow(mx - cx, 2) + Math.pow(my - cy, 2));

                if (dist < 80) {
                    near = true;
                    break;
                }
            }

            if (near !== this.isNearCTA) {
                this.isNearCTA = near;
                if (near) {
                    this.cursor.classList.add('near-cta');
                } else {
                    this.cursor.classList.remove('near-cta');
                }
            }
        };

        CustomCursorEffects.prototype.animate = function () {
            var self = this;

            // Smooth following with delay
            this.cursorX += (this.mouseX - this.cursorX) * 0.15;
            this.cursorY += (this.mouseY - this.cursorY) * 0.15;

            if (this.cursor) {
                this.cursor.style.left = this.cursorX + 'px';
                this.cursor.style.top = this.cursorY + 'px';
            }

            this.rafId = requestAnimationFrame(function () {
                self.animate();
            });
        };

        return CustomCursorEffects;
    })();


    // ==========================================
    // 2. MOBILE-SPECIFIC ENHANCEMENTS
    // ==========================================

    // ------------------------------------------
    // 2A. Bottom Navigation Bar
    // Mobile-only sticky bottom nav with 5 tabs
    // ------------------------------------------
    var BottomNavBar = (function () {
        function BottomNavBar() {
            if (!isMobileWidth()) return;
            this.nav = null;
            this.init();
        }

        BottomNavBar.prototype.init = function () {
            var self = this;

            // Don't create if already exists
            if (document.querySelector('.v2-bottom-nav')) return;

            injectStyles('v2-bottom-nav', [
                '.v2-bottom-nav {',
                '  position: fixed; bottom: 0; left: 0; right: 0;',
                '  z-index: 9998;',
                '  background: var(--bg-primary, #fff);',
                '  border-top: 1px solid var(--border-color, #e0e0e0);',
                '  display: flex; align-items: center; justify-content: space-around;',
                '  padding: 6px 0 env(safe-area-inset-bottom, 8px);',
                '  height: 60px;',
                '  backdrop-filter: blur(12px);',
                '  -webkit-backdrop-filter: blur(12px);',
                '  box-shadow: 0 -2px 10px rgba(0,0,0,0.08);',
                '}',
                '.v2-bottom-nav-item {',
                '  display: flex; flex-direction: column; align-items: center;',
                '  gap: 2px; padding: 4px 0; cursor: pointer;',
                '  color: var(--text-muted, #888); text-decoration: none;',
                '  font-size: 0.6rem; font-weight: 500;',
                '  transition: color 0.2s ease; flex: 1; text-align: center;',
                '  background: none; border: none; -webkit-tap-highlight-color: transparent;',
                '}',
                '.v2-bottom-nav-item svg { width: 20px; height: 20px; }',
                '.v2-bottom-nav-item.active, .v2-bottom-nav-item:active { color: var(--accent-blue, #00a8ff); }',
                '.v2-bottom-nav-cta {',
                '  display: flex; flex-direction: column; align-items: center;',
                '  gap: 2px; cursor: pointer; flex: 1; text-align: center;',
                '  background: none; border: none; -webkit-tap-highlight-color: transparent;',
                '  margin-top: -20px;',
                '}',
                '.v2-bottom-nav-cta-btn {',
                '  width: 48px; height: 48px; border-radius: 50%;',
                '  background: linear-gradient(135deg, var(--accent-blue, #00a8ff), var(--accent-orange, #ff6b35));',
                '  color: #fff; display: flex; align-items: center; justify-content: center;',
                '  box-shadow: 0 4px 12px rgba(0, 168, 255, 0.4);',
                '  transition: transform 0.2s ease;',
                '}',
                '.v2-bottom-nav-cta-btn:active { transform: scale(0.92); }',
                '.v2-bottom-nav-cta-btn svg { width: 22px; height: 22px; }',
                '.v2-bottom-nav-cta span { font-size: 0.6rem; font-weight: 600; color: var(--accent-blue, #00a8ff); }',
                '@media (min-width: 769px) { .v2-bottom-nav { display: none !important; } }',
                'body.v2-bottom-nav-active { padding-bottom: 68px; }'
            ].join('\n'));

            var currentPath = window.location.pathname;
            var pageName = currentPath.split('/').pop() || 'index.html';

            // Determine active tab
            function isActive(page) {
                if (page === 'index.html' && (pageName === '' || pageName === 'index.html')) return true;
                return pageName === page;
            }

            this.nav = document.createElement('nav');
            this.nav.className = 'v2-bottom-nav';
            this.nav.setAttribute('aria-label', 'Mobile navigation');
            this.nav.innerHTML = [
                '<a href="index.html" class="v2-bottom-nav-item' + (isActive('index.html') ? ' active' : '') + '" data-page="home">',
                '  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
                '  <span>Home</span>',
                '</a>',
                '<a href="services.html" class="v2-bottom-nav-item' + (isActive('services.html') ? ' active' : '') + '" data-page="services">',
                '  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>',
                '  <span>Services</span>',
                '</a>',
                '<a href="https://wa.me/917066607424" target="_blank" rel="noopener" class="v2-bottom-nav-cta" data-page="whatsapp">',
                '  <div class="v2-bottom-nav-cta-btn">',
                '    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
                '  </div>',
                '  <span>WhatsApp</span>',
                '</a>',
                '<a href="about.html" class="v2-bottom-nav-item' + (isActive('about.html') || isActive('team.html') ? ' active' : '') + '" data-page="about">',
                '  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
                '  <span>About</span>',
                '</a>',
                '<a href="contact.html" class="v2-bottom-nav-item' + (isActive('contact.html') ? ' active' : '') + '" data-page="contact">',
                '  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>',
                '  <span>Contact</span>',
                '</a>'
            ].join('\n');

            document.body.appendChild(this.nav);
            document.body.classList.add('v2-bottom-nav-active');

            // Haptic feedback on tab clicks
            this.nav.addEventListener('click', function (e) {
                var item = e.target.closest('.v2-bottom-nav-item, .v2-bottom-nav-cta');
                if (item) haptic(10);
            });
        };

        return BottomNavBar;
    })();

    // ------------------------------------------
    // 2B. Extended Swipe Gestures
    // Horizontal swipe for .testimonials-container
    // and .blog-grid
    // ------------------------------------------
    var SwipeGestureExtension = (function () {
        function SwipeGestureExtension() {
            if (prefersReducedMotion) return;
            this.init();
        }

        SwipeGestureExtension.prototype.init = function () {
            var self = this;
            var containers = document.querySelectorAll('.testimonials-container, .blog-grid');

            containers.forEach(function (container) {
                var startX = 0;
                var startY = 0;

                container.addEventListener('touchstart', function (e) {
                    startX = e.changedTouches[0].screenX;
                    startY = e.changedTouches[0].screenY;
                }, { passive: true });

                container.addEventListener('touchend', function (e) {
                    var endX = e.changedTouches[0].screenX;
                    var endY = e.changedTouches[0].screenY;
                    var deltaX = endX - startX;
                    var deltaY = endY - startY;

                    // Only trigger if horizontal swipe is dominant and > 50px
                    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
                        var cardWidth = self.getCardWidth(container);
                        var scrollAmount = deltaX > 0 ? -cardWidth : cardWidth;
                        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                    }
                }, { passive: true });
            });
        };

        SwipeGestureExtension.prototype.getCardWidth = function (container) {
            var firstCard = container.children[0];
            if (!firstCard) return 300;
            return firstCard.offsetWidth + 20; // card width + gap
        };

        return SwipeGestureExtension;
    })();

    // ------------------------------------------
    // 2C. App-Like Mobile Menu Enhancement
    // iOS-style section headers, backdrop blur on scroll
    // ------------------------------------------
    var AppLikeMobileMenu = (function () {
        function AppLikeMobileMenu() {
            this.mobileMenuLinks = document.querySelector('.mobile-nav-links');
            this.mobileMenuInner = document.querySelector('.mobile-menu-inner');
            this.mobileMenu = document.getElementById('mobileMenu');
            this.init();
        }

        AppLikeMobileMenu.prototype.init = function () {
            if (!this.mobileMenuLinks) return;
            this.addScrollBlur();
        };

        AppLikeMobileMenu.prototype.addScrollBlur = function () {
            var inner = this.mobileMenuInner;
            if (!inner) return;

            inner.addEventListener('scroll', function () {
                var scrolled = inner.scrollTop;
                var maxBlur = 16;
                var blur = Math.min(scrolled / 20, maxBlur);
                inner.style.backdropFilter = 'blur(' + (12 + blur) + 'px)';
                inner.style.webkitBackdropFilter = 'blur(' + (12 + blur) + 'px)';
            }, { passive: true });
        };

        return AppLikeMobileMenu;
    })();

    // ------------------------------------------
    // 2D. Haptic Feedback
    // Subtle vibrations on key interactions
    // ------------------------------------------
    var HapticFeedback = (function () {
        function HapticFeedback() {
            this.init();
        }

        HapticFeedback.prototype.init = function () {
            // Button clicks
            document.addEventListener('click', function (e) {
                if (e.target.closest('.btn, button')) {
                    haptic(10);
                }
            }, { passive: true });

            // Mobile menu open/close — observe class changes
            var mobileMenu = document.getElementById('mobileMenu');
            if (mobileMenu) {
                var observer = new MutationObserver(function (mutations) {
                    mutations.forEach(function (m) {
                        if (m.attributeName === 'class') {
                            haptic(10);
                        }
                    });
                });
                observer.observe(mobileMenu, { attributes: true });
            }

            // Bottom nav tab switch — handled in BottomNavBar init
        };

        return HapticFeedback;
    })();


    // ==========================================
    // 3. PERFORMANCE OPTIMIZATIONS
    // ==========================================

    // ------------------------------------------
    // 3A. Prefetch Likely Next Pages
    // Add low-priority prefetch links based on
    // current page
    // ------------------------------------------
    var PagePrefetcher = (function () {
        function PagePrefetcher() {
            this.init();
        }

        PagePrefetcher.prototype.init = function () {
            var prefetchMap = {
                'index.html': ['about.html', 'services.html'],
                'about.html': ['services.html', 'team.html'],
                'services.html': ['pricing.html', 'portfolio.html'],
                'pricing.html': ['services.html', 'contact.html'],
                'contact.html': ['services.html', 'about.html'],
                'blog.html': ['blog-post.html', 'services.html'],
                'portfolio.html': ['services.html', 'case-study.html'],
                'team.html': ['about.html', 'contact.html'],
                'help-center.html': ['contact.html', 'services.html']
            };

            var currentPage = window.location.pathname.split('/').pop() || 'index.html';
            var pagesToPrefetch = prefetchMap[currentPage] || [];

            pagesToPrefetch.forEach(function (page) {
                var link = document.createElement('link');
                link.rel = 'prefetch';
                link.href = page;
                link.setAttribute('fetchpriority', 'low');
                document.head.appendChild(link);
            });
        };

        return PagePrefetcher;
    })();

    // ------------------------------------------
    // 3B. Service Worker Registration
    // Register /sw.js if supported
    // ------------------------------------------
    var ServiceWorkerRegistrar = (function () {
        function ServiceWorkerRegistrar() {
            this.init();
        }

        ServiceWorkerRegistrar.prototype.init = function () {
            if (!('serviceWorker' in navigator)) return;

            try {
                window.addEventListener('load', function () {
                    navigator.serviceWorker.register('/sw.js').then(function (reg) {
                        console.log('[NueEra] Service Worker registered:', reg.scope);
                    }).catch(function (err) {
                        console.warn('[NueEra] Service Worker registration failed:', err);
                    });
                });
            } catch (e) {
                console.warn('[NueEra] Service Worker not supported');
            }
        };

        return ServiceWorkerRegistrar;
    })();

    // ------------------------------------------
    // 3C. Minify Detection
    // Console warnings if CSS/JS files exceed
    // size thresholds in development
    // ------------------------------------------
    var MinifyDetection = (function () {
        function MinifyDetection() {
            this.init();
        }

        MinifyDetection.prototype.init = function () {
            // Only run in development (localhost or file://)
            var isDev = window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1' ||
                window.location.protocol === 'file:';

            if (!isDev) return;

            var thresholds = {
                'css/styles.css': 100 * 1024,         // 100KB
                'css/premium-upgrade.css': 50 * 1024,  // 50KB
                'js/main.js': 100 * 1024,
                'js/enhancements.js': 80 * 1024,
                'js/enhancements-v2.js': 80 * 1024
            };

            Object.keys(thresholds).forEach(function (filePath) {
                try {
                    var xhr = new XMLHttpRequest();
                    xhr.open('HEAD', filePath, true);
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState === 4 && xhr.status === 200) {
                            var size = parseInt(xhr.getResponseHeader('Content-Length'), 10);
                            if (size && size > thresholds[filePath]) {
                                console.warn(
                                    '[NueEra Minify] ' + filePath + ' is ' +
                                    (size / 1024).toFixed(1) + 'KB (threshold: ' +
                                    (thresholds[filePath] / 1024).toFixed(0) + 'KB). Consider minifying.'
                                );
                            }
                        }
                    };
                    xhr.send();
                } catch (e) {
                    // Silently fail — HEAD requests may be blocked
                }
            });
        };

        return MinifyDetection;
    })();


    // ==========================================
    // 4. SEO & ACCESSIBILITY
    // ==========================================

    // ------------------------------------------
    // 4A. Section Skip Links
    // Dynamically generated skip links for
    // sections with IDs
    // ------------------------------------------
    var SectionSkipLinks = (function () {
        function SectionSkipLinks() {
            this.init();
        }

        SectionSkipLinks.prototype.init = function () {
            var self = this;

            injectStyles('v2-section-skip-links', [
                '.v2-section-skip-nav {',
                '  position: fixed; top: -100px; left: 50%; transform: translateX(-50%);',
                '  z-index: 10001; display: flex; gap: 4px;',
                '  padding: 8px; border-radius: 0 0 8px 8px;',
                '  background: var(--bg-primary, #fff);',
                '  box-shadow: 0 4px 12px rgba(0,0,0,0.15);',
                '  transition: top 0.2s ease;',
                '}',
                '.v2-section-skip-nav:focus-within { top: 0; }',
                '.v2-section-skip-link {',
                '  padding: 6px 12px; font-size: 0.8rem;',
                '  background: var(--accent-blue, #00a8ff); color: #fff;',
                '  border-radius: 4px; text-decoration: none;',
                '  white-space: nowrap;',
                '}'
            ].join('\n'));

            var sections = document.querySelectorAll('section[id]');
            if (sections.length === 0) return;

            var nav = document.createElement('nav');
            nav.className = 'v2-section-skip-nav';
            nav.setAttribute('aria-label', 'Section skip links');

            sections.forEach(function (section) {
                var id = section.getAttribute('id');
                if (!id) return;

                var heading = section.querySelector('h1, h2, h3');
                var label = heading ? heading.textContent.trim() : id.replace(/-/g, ' ');

                var link = document.createElement('a');
                link.className = 'v2-section-skip-link';
                link.href = '#' + id;
                link.textContent = 'Skip to ' + label;
                nav.appendChild(link);
            });

            // Insert after skip-link if it exists, otherwise at body start
            var existingSkipLink = document.querySelector('.skip-link');
            if (existingSkipLink && existingSkipLink.nextSibling) {
                existingSkipLink.parentNode.insertBefore(nav, existingSkipLink.nextSibling);
            } else {
                document.body.insertBefore(nav, document.body.firstChild);
            }
        };

        return SectionSkipLinks;
    })();

    // ------------------------------------------
    // 4B. Focus Trap in Mobile Menu
    // Trap Tab focus within .mobile-menu-inner
    // ------------------------------------------
    var MobileMenuFocusTrap = (function () {
        function MobileMenuFocusTrap() {
            this.mobileMenu = document.getElementById('mobileMenu');
            this.mobileMenuInner = document.querySelector('.mobile-menu-inner');
            this.init();
        }

        MobileMenuFocusTrap.prototype.init = function () {
            if (!this.mobileMenu || !this.mobileMenuInner) return;

            var inner = this.mobileMenuInner;
            var menu = this.mobileMenu;
            var self = this;

            document.addEventListener('keydown', function (e) {
                if (!menu.classList.contains('open')) return;

                if (e.key === 'Escape') {
                    // Close menu
                    menu.classList.remove('open');
                    document.documentElement.classList.remove('lock-scroll');
                    var menuBtn = document.querySelector('.mobile-menu-btn');
                    if (menuBtn) {
                        menuBtn.setAttribute('aria-expanded', 'false');
                        menuBtn.focus();
                    }
                    haptic(10);
                    return;
                }

                if (e.key !== 'Tab') return;

                var focusableSelectors = 'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])';
                var focusableElements = Array.from(inner.querySelectorAll(focusableSelectors)).filter(function (el) {
                    return !el.disabled && el.offsetParent !== null;
                });

                if (focusableElements.length === 0) return;

                var first = focusableElements[0];
                var last = focusableElements[focusableElements.length - 1];

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
        };

        return MobileMenuFocusTrap;
    })();

    // ------------------------------------------
    // 4C. High Contrast Mode
    // Toggle button that adds data-contrast="high"
    // ------------------------------------------
    var HighContrastMode = (function () {
        function HighContrastMode() {
            this.active = localStorage.getItem('nueera-high-contrast') === 'true';
            this.init();
        }

        HighContrastMode.prototype.init = function () {
            var self = this;

            injectStyles('v2-high-contrast', [
                '[data-contrast="high"] {',
                '  --text-primary: #000 !important;',
                '  --text-secondary: #1a1a1a !important;',
                '  --text-muted: #444 !important;',
                '  --bg-primary: #fff !important;',
                '  --bg-secondary: #f5f5f5 !important;',
                '  --bg-tertiary: #eee !important;',
                '}',
                '[data-contrast="high"] .service-card,',
                '[data-contrast="high"] .feature-card,',
                '[data-contrast="high"] .blog-card,',
                '[data-contrast="high"] .pricing-card,',
                '[data-contrast="high"] .team-card,',
                '[data-contrast="high"] .testimonial-card {',
                '  border: 2px solid #333 !important;',
                '  box-shadow: none !important;',
                '}',
                '[data-contrast="high"] .btn {',
                '  border-width: 2px !important;',
                '  font-weight: 700 !important;',
                '}',
                '[data-contrast="high"] .btn-primary {',
                '  background: #000 !important; color: #fff !important;',
                '  border-color: #000 !important;',
                '}',
                '.v2-contrast-toggle {',
                '  display: inline-flex; align-items: center; gap: 6px;',
                '  background: var(--bg-glass, rgba(255,255,255,0.1));',
                '  border: 1px solid var(--border-color, #ccc);',
                '  color: var(--text-secondary, #555);',
                '  padding: 6px 12px; border-radius: 6px;',
                '  cursor: pointer; font-size: 0.8rem;',
                '  transition: all 0.2s ease;',
                '}',
                '.v2-contrast-toggle:hover {',
                '  background: var(--bg-tertiary, #e0e0e0);',
                '}',
                '.v2-contrast-toggle.active {',
                '  background: var(--accent-blue, #00a8ff); color: #fff;',
                '  border-color: var(--accent-blue, #00a8ff);',
                '}'
            ].join('\n'));

            // Apply initial state
            if (this.active) {
                document.documentElement.setAttribute('data-contrast', 'high');
            }

            // Create toggle button in footer
            var footer = document.querySelector('footer');
            if (!footer) return;

            var container = footer.querySelector('.container') || footer;
            var btn = document.createElement('button');
            btn.className = 'v2-contrast-toggle' + (this.active ? ' active' : '');
            btn.setAttribute('aria-label', 'Toggle high contrast mode');
            btn.setAttribute('aria-pressed', String(this.active));
            btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg> High Contrast';

            btn.addEventListener('click', function () {
                self.active = !self.active;
                if (self.active) {
                    document.documentElement.setAttribute('data-contrast', 'high');
                    btn.classList.add('active');
                } else {
                    document.documentElement.removeAttribute('data-contrast');
                    btn.classList.remove('active');
                }
                btn.setAttribute('aria-pressed', String(self.active));
                localStorage.setItem('nueera-high-contrast', String(self.active));
                haptic(10);
            });

            container.appendChild(btn);
        };

        return HighContrastMode;
    })();


    // ==========================================
    // 5. ADDITIONAL FEATURES
    // ==========================================

    // ------------------------------------------
    // 5A. Testimonial Carousel / Slider
    // Auto-rotating carousel on testimonials.html
    // ------------------------------------------
    var TestimonialCarousel = (function () {
        function TestimonialCarousel() {
            // Only activate on testimonials page
            var isTestimonialsPage = window.location.pathname.indexOf('testimonial') !== -1;
            this.container = document.querySelector('.testimonials-container');
            if (!this.container || !isTestimonialsPage) return;

            this.cards = Array.from(this.container.querySelectorAll('.testimonial-card'));
            if (this.cards.length <= 1) return;

            this.currentIndex = 0;
            this.autoPlayInterval = null;
            this.isPaused = false;
            this.touchStartX = 0;
            this.touchStartY = 0;

            if (prefersReducedMotion) return;

            this.init();
        }

        TestimonialCarousel.prototype.init = function () {
            var self = this;

            // Inject carousel styles
            injectStyles('v2-testimonial-carousel', [
                '.v2-carousel-wrapper { position: relative; overflow: hidden; }',
                '.v2-carousel-track {',
                '  display: flex; transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);',
                '}',
                '.v2-carousel-track .testimonial-card {',
                '  flex: 0 0 100%; max-width: 100%; box-sizing: border-box;',
                '}',
                '@media (min-width: 769px) {',
                '  .v2-carousel-track .testimonial-card { flex: 0 0 50%; max-width: 50%; }',
                '}',
                '@media (min-width: 1025px) {',
                '  .v2-carousel-track .testimonial-card { flex: 0 0 33.333%; max-width: 33.333%; }',
                '}',
                '.v2-carousel-dots {',
                '  display: flex; justify-content: center; gap: 8px;',
                '  margin-top: 1.5rem;',
                '}',
                '.v2-carousel-dot {',
                '  width: 10px; height: 10px; border-radius: 50%;',
                '  background: var(--border-color, #ccc); border: none; cursor: pointer;',
                '  transition: background 0.2s ease, transform 0.2s ease;',
                '  padding: 0;',
                '}',
                '.v2-carousel-dot.active {',
                '  background: var(--accent-blue, #00a8ff); transform: scale(1.3);',
                '}'
            ].join('\n'));

            // Wrap container
            var wrapper = document.createElement('div');
            wrapper.className = 'v2-carousel-wrapper';

            this.container.parentNode.insertBefore(wrapper, this.container);
            wrapper.appendChild(this.container);

            // Add track class
            this.container.classList.add('v2-carousel-track');

            // Create dot indicators
            this.dotsContainer = document.createElement('div');
            this.dotsContainer.className = 'v2-carousel-dots';
            this.dotsContainer.setAttribute('role', 'tablist');
            this.dotsContainer.setAttribute('aria-label', 'Testimonial carousel navigation');
            wrapper.appendChild(this.dotsContainer);

            var totalDots = this.getVisibleCount() > 1 ? Math.ceil(this.cards.length / this.getVisibleCount()) : this.cards.length;

            for (var i = 0; i < totalDots; i++) {
                var dot = document.createElement('button');
                dot.className = 'v2-carousel-dot' + (i === 0 ? ' active' : '');
                dot.setAttribute('aria-label', 'Go to testimonial group ' + (i + 1));
                dot.setAttribute('role', 'tab');
                dot.dataset.index = i;
                this.dotsContainer.appendChild(dot);
            }

            this.updateCarousel();

            // Dot click events
            this.dotsContainer.addEventListener('click', function (e) {
                var dot = e.target.closest('.v2-carousel-dot');
                if (!dot) return;
                self.currentIndex = parseInt(dot.dataset.index, 10);
                self.updateCarousel();
                haptic(10);
            });

            // Pause on hover
            wrapper.addEventListener('mouseenter', function () { self.isPaused = true; });
            wrapper.addEventListener('mouseleave', function () { self.isPaused = false; });

            // Swipe support
            wrapper.addEventListener('touchstart', function (e) {
                self.touchStartX = e.changedTouches[0].screenX;
                self.touchStartY = e.changedTouches[0].screenY;
            }, { passive: true });

            wrapper.addEventListener('touchend', function (e) {
                var endX = e.changedTouches[0].screenX;
                var endY = e.changedTouches[0].screenY;
                var deltaX = endX - self.touchStartX;
                var deltaY = endY - self.touchStartY;

                if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
                    if (deltaX < 0) {
                        self.next();
                    } else {
                        self.prev();
                    }
                }
            }, { passive: true });

            // Auto-rotate
            this.startAutoPlay();

            // Handle resize
            window.addEventListener('resize', debounceLocal(function () {
                self.updateCarousel();
            }, 200));
        };

        TestimonialCarousel.prototype.getVisibleCount = function () {
            if (window.innerWidth >= 1025) return 3;
            if (window.innerWidth >= 769) return 2;
            return 1;
        };

        TestimonialCarousel.prototype.getMaxIndex = function () {
            var visible = this.getVisibleCount();
            return Math.max(0, Math.ceil(this.cards.length / visible) - 1);
        };

        TestimonialCarousel.prototype.next = function () {
            this.currentIndex = this.currentIndex >= this.getMaxIndex() ? 0 : this.currentIndex + 1;
            this.updateCarousel();
        };

        TestimonialCarousel.prototype.prev = function () {
            this.currentIndex = this.currentIndex <= 0 ? this.getMaxIndex() : this.currentIndex - 1;
            this.updateCarousel();
        };

        TestimonialCarousel.prototype.updateCarousel = function () {
            var visible = this.getVisibleCount();
            var slideWidth = 100 / visible;
            var offset = -(this.currentIndex * visible * slideWidth);

            // Clamp to not exceed bounds
            var maxOffset = -(this.cards.length * slideWidth - 100);
            offset = Math.max(offset, maxOffset);

            this.container.style.transform = 'translateX(' + offset + '%)';

            // Update dots
            if (this.dotsContainer) {
                var dots = this.dotsContainer.querySelectorAll('.v2-carousel-dot');
                dots.forEach(function (dot, i) {
                    dot.classList.toggle('active', i === this.currentIndex);
                }.bind(this));
            }
        };

        TestimonialCarousel.prototype.startAutoPlay = function () {
            var self = this;
            this.autoPlayInterval = setInterval(function () {
                if (!self.isPaused) {
                    self.next();
                }
            }, 5000);
        };

        return TestimonialCarousel;
    })();

    // ------------------------------------------
    // 5B. Extended Scroll Animations
    // Extend existing ScrollAnimations to handle
    // additional element selectors
    // ------------------------------------------
    var ExtendedScrollAnimations = (function () {
        function ExtendedScrollAnimations() {
            if (prefersReducedMotion) return;
            this.init();
        }

        ExtendedScrollAnimations.prototype.init = function () {
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -80px 0px'
            });

            var selectors = [
                '.approach-item',
                '.architecture-card',
                '.story-step',
                '.benefit-card',
                '.value-card',
                '.reason-card',
                '.framework-card',
                '.journey-item'
            ];

            selectors.forEach(function (selector) {
                document.querySelectorAll(selector).forEach(function (el) {
                    el.classList.add('reveal');
                    observer.observe(el);
                });
            });
        };

        return ExtendedScrollAnimations;
    })();


    // ==========================================
    // INITIALIZATION
    // ==========================================

    function initAll() {
        try { new PageTransitionEnhancer(); } catch (e) { console.warn('[NueEra V2] PageTransitionEnhancer:', e); }
        try { new EnhancedCounterAnimations(); } catch (e) { console.warn('[NueEra V2] EnhancedCounterAnimations:', e); }
        try { new ParallaxTeamCards(); } catch (e) { console.warn('[NueEra V2] ParallaxTeamCards:', e); }
        try { new MicroInteractions(); } catch (e) { console.warn('[NueEra V2] MicroInteractions:', e); }
        try { new DarkModeHeroImagery(); } catch (e) { console.warn('[NueEra V2] DarkModeHeroImagery:', e); }
        try { new SkeletonLoadingExtension(); } catch (e) { console.warn('[NueEra V2] SkeletonLoadingExtension:', e); }
        try { new GradientBorderCards(); } catch (e) { console.warn('[NueEra V2] GradientBorderCards:', e); }
        try { new CustomCursorEffects(); } catch (e) { console.warn('[NueEra V2] CustomCursorEffects:', e); }

        // BottomNavBar disabled — using HTML-based mobile-bottom-nav instead
        // try { new BottomNavBar(); } catch (e) { console.warn('[NueEra V2] BottomNavBar:', e); }
        try { new SwipeGestureExtension(); } catch (e) { console.warn('[NueEra V2] SwipeGestureExtension:', e); }
        try { new AppLikeMobileMenu(); } catch (e) { console.warn('[NueEra V2] AppLikeMobileMenu:', e); }
        try { new HapticFeedback(); } catch (e) { console.warn('[NueEra V2] HapticFeedback:', e); }

        try { new PagePrefetcher(); } catch (e) { console.warn('[NueEra V2] PagePrefetcher:', e); }
        try { new ServiceWorkerRegistrar(); } catch (e) { console.warn('[NueEra V2] ServiceWorkerRegistrar:', e); }
        try { new MinifyDetection(); } catch (e) { console.warn('[NueEra V2] MinifyDetection:', e); }

        try { new SectionSkipLinks(); } catch (e) { console.warn('[NueEra V2] SectionSkipLinks:', e); }
        try { new MobileMenuFocusTrap(); } catch (e) { console.warn('[NueEra V2] MobileMenuFocusTrap:', e); }
        try { new HighContrastMode(); } catch (e) { console.warn('[NueEra V2] HighContrastMode:', e); }

        try { new TestimonialCarousel(); } catch (e) { console.warn('[NueEra V2] TestimonialCarousel:', e); }
        try { new ExtendedScrollAnimations(); } catch (e) { console.warn('[NueEra V2] ExtendedScrollAnimations:', e); }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }

})();
