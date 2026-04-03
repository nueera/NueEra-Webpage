// ==========================================
// NUEERA - ANALYTICS MANAGER
// Google Analytics with Cookie Consent
// ==========================================

class AnalyticsManager {
    constructor() {
        this.measurementId = ''; // Set your GA4 Measurement ID (e.g., 'G-XXXXXXXXXX')
        this.consentGiven = localStorage.getItem('nueera-analytics-consent') === 'granted';
        this.init();
    }

    init() {
        if (this.consentGiven) {
            this.loadAnalytics();
        }
        this.trackCookieConsent();
    }

    loadAnalytics() {
        if (!this.measurementId) {
            console.log('Analytics: No Measurement ID configured');
            return;
        }

        // Load Google Analytics 4
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', this.measurementId, {
            anonymize_ip: true,
            allow_google_signals: false,
            allow_ad_personalization_signals: false
        });

        // Load the gtag script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
        document.head.appendChild(script);

        console.log('Analytics: Loaded with consent');
    }

    trackCookieConsent() {
        const consent = localStorage.getItem('nueera-cookie-consent');
        if (!consent) return;

        // Send consent to analytics if granted
        if (consent === 'accepted' && !this.consentGiven) {
            this.consentGiven = true;
            localStorage.setItem('nueera-analytics-consent', 'granted');
            this.loadAnalytics();
        }
    }

    grantConsent() {
        this.consentGiven = true;
        localStorage.setItem('nueera-analytics-consent', 'granted');
        this.loadAnalytics();
    }

    revokeConsent() {
        this.consentGiven = false;
        localStorage.setItem('nueera-analytics-consent', 'denied');
        // Disable analytics by purging data
        if (window.gtag) {
            window.gtag('consent', 'default', {
                analytics_storage: 'denied'
            });
        }
    }

    // Track page views
    trackPageView(pagePath, pageTitle) {
        if (!this.consentGiven || !window.gtag) return;
        window.gtag('event', 'page_view', {
            page_path: pagePath,
            page_title: pageTitle
        });
    }

    // Track events
    trackEvent(eventName, eventParams = {}) {
        if (!this.consentGiven || !window.gtag) return;
        window.gtag('event', eventName, eventParams);
    }
}

// Initialize analytics manager
const analyticsManager = new AnalyticsManager();

// Export for external use
window.NueEra = window.NueEra || {};
window.NueEra.analytics = analyticsManager;
