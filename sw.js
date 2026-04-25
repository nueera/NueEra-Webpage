/**
 * NueEra Service Worker v2
 *
 * Strategies:
 *   - Cache-first  → static assets (CSS, JS, images, fonts)
 *   - Network-first → HTML pages
 *
 * Cache name: nueera-v2
 * Max cache age for static assets: 7 days
 */

const CACHE_NAME = 'nueera-v2';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Critical assets to pre-cache on install
const PRECACHE_URLS = [
  '/',
  '/css/styles.css',
  '/css/premium-upgrade.css',
  '/css/enhancements.css',
  '/js/main.js',
  '/js/enhancements.js',
  '/js/enhancements-v2.js',
  '/assets/images/lightlogo.png',
  '/assets/images/darklogo.png',
];

// File extensions that qualify as static assets (cache-first)
const STATIC_EXTENSIONS = [
  'css', 'js', 'mjs',
  'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico',
  'woff', 'woff2', 'ttf', 'otf', 'eot',
  'json', 'xml', 'webmanifest',
];

// ─── Install ─────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Pre-cache critical assets — use addAll-like behaviour but tolerate
        // individual failures so a missing asset doesn't block installation.
        return Promise.allSettled(
          PRECACHE_URLS.map((url) =>
            cache.add(url).catch((err) => {
              console.warn(`[SW] Failed to pre-cache "${url}":`, err.message);
            })
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// ─── Activate ────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Removing old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Determine whether a request is for an HTML document.
 */
function isHTMLRequest(request) {
  const accept = request.headers.get('Accept') || '';
  return accept.includes('text/html');
}

/**
 * Determine whether a URL points to a static asset based on its extension.
 */
function isStaticAsset(url) {
  const pathname = new URL(url).pathname;
  const ext = pathname.split('.').pop().toLowerCase();
  return STATIC_EXTENSIONS.includes(ext);
}

/**
 * Check whether a cached response has exceeded the maximum age.
 * Returns true if the entry is stale and should be evicted.
 */
function isStale(cachedResponse) {
  if (!cachedResponse) return true;
  const dateHeader = cachedResponse.headers.get('date');
  if (!dateHeader) return false; // no date → keep it
  const cachedTime = new Date(dateHeader).getTime();
  return (Date.now() - cachedTime) > MAX_AGE_MS;
}

/**
 * Validate that a response is cacheable.
 * Rejects opaque (status 0) responses and non-OK responses.
 */
function isCacheable(response) {
  // Opaque responses (cross-origin, no CORS) have status 0 — skip them
  if (response.status === 0) return false;
  return response.ok;
}

/**
 * Store a response in cache, attaching a Date header for age tracking.
 */
async function cacheResponse(request, response) {
  if (!isCacheable(response)) return;

  const body = await response.blob();
  const headers = new Headers(response.headers);
  if (!headers.has('date')) {
    headers.set('date', new Date().toUTCString());
  }

  const cacheableResponse = new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });

  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, cacheableResponse);
}

// ─── Fetch ───────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Strategy routing
  if (isHTMLRequest(request)) {
    event.respondWith(networkFirstForHTML(request));
  } else if (isStaticAsset(request.url)) {
    event.respondWith(cacheFirstForStatic(request));
  }
  // Non-static, non-HTML requests pass through without SW intervention
});

/**
 * Network-first strategy for HTML pages.
 * 1. Try the network.
 * 2. On failure, fall back to cache.
 */
async function networkFirstForHTML(request) {
  try {
    const networkResponse = await fetch(request);
    // Cache a copy for offline fallback (only if cacheable)
    if (isCacheable(networkResponse)) {
      await cacheResponse(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (networkError) {
    // Network failed — try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // If even the cache doesn't have it, return a basic offline page
    return new Response(
      '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>Offline — NueEra</title>' +
      '<style>body{display:flex;align-items:center;justify-content:center;' +
      'min-height:100vh;margin:0;font-family:system-ui,sans-serif;' +
      'background:#0a0e27;color:#fff;text-align:center}' +
      'h1{font-size:2rem;margin-bottom:.5rem}' +
      'p{opacity:.7}</style></head>' +
      '<body><div><h1>You\'re Offline</h1>' +
      '<p>Please check your connection and try again.</p></div></body></html>',
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}

/**
 * Cache-first strategy for static assets.
 * 1. Check the cache for a fresh (non-stale) entry.
 * 2. If found, return it and optionally refresh in the background.
 * 3. If not found or stale, fetch from network, cache the response, return it.
 */
async function cacheFirstForStatic(request) {
  const cachedResponse = await caches.match(request);

  // Return cached response if it exists and hasn't exceeded max age
  if (cachedResponse && !isStale(cachedResponse)) {
    // Stale-while-revalidate: kick off a background refresh
    refreshInBackground(request);
    return cachedResponse;
  }

  // If stale, evict it
  if (cachedResponse && isStale(cachedResponse)) {
    const cache = await caches.open(CACHE_NAME);
    await cache.delete(request);
  }

  try {
    const networkResponse = await fetch(request);
    // Cache the fresh response for future requests
    await cacheResponse(request, networkResponse.clone());
    return networkResponse;
  } catch (networkError) {
    // Network failed — if we still have a stale copy, return it as last resort
    if (cachedResponse) {
      return cachedResponse;
    }
    // Nothing available — return a transparent 1×1 image for image requests,
    // or a generic error otherwise
    if (/\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(new URL(request.url).pathname)) {
      // Return a 1×1 transparent PNG using browser-compatible base64 decoding
      const binaryStr = atob(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQAB' +
        'Nl7BcQAAAABJRU5ErkJggg=='
      );
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      return new Response(bytes, { headers: { 'Content-Type': 'image/png' } });
    }
    return new Response('', { status: 503, statusText: 'Service Unavailable' });
  }
}

/**
 * Background refresh: fetch a fresh copy and update the cache silently.
 * Failures are swallowed since we already served the cached version.
 */
async function refreshInBackground(request) {
  try {
    const networkResponse = await fetch(request);
    if (isCacheable(networkResponse)) {
      await cacheResponse(request, networkResponse);
    }
  } catch {
    // Swallow — background refresh is best-effort
  }
}
