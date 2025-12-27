/**
 * Service Worker for WebRTC Phone PWA
 * Handles push notifications, offline caching, and PWA installation
 */

const CACHE_NAME = 'webrtc-phone-v1';
const STATIC_ASSETS = [
  '/',
  '/owner',
  '/index.html',
  '/owner.html',
  '/manifest.json',
  '/manifest-owner.json',
  '/icon-192.png',
  '/icon-512.png'
];

// =============================================================================
// INSTALL - Cache static assets
// =============================================================================

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Install complete');
        return self.skipWaiting();
      })
  );
});

// =============================================================================
// ACTIVATE - Clean up old caches
// =============================================================================

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Activate complete');
        return self.clients.claim();
      })
  );
});

// =============================================================================
// FETCH - Network-first strategy with fallback to cache
// =============================================================================

self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip WebSocket and socket.io requests
  if (event.request.url.includes('socket.io')) return;
  
  // Skip API requests - always go to network
  if (event.request.url.includes('/api/')) return;
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response before caching
        const responseClone = response.clone();
        
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseClone);
          });
        
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
          });
      })
  );
});

// =============================================================================
// PUSH - Handle push notifications
// =============================================================================

self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);
  
  let data = {
    title: 'Incoming Call',
    body: 'Someone is trying to reach you',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: {}
  };
  
  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }
  
  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/icon-192.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: 'incoming-call',
    renotify: true,
    requireInteraction: true,
    data: data.data,
    actions: [
      {
        action: 'answer',
        title: '📞 Answer',
        icon: '/icon-192.png'
      },
      {
        action: 'decline',
        title: '❌ Decline',
        icon: '/icon-192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// =============================================================================
// NOTIFICATION CLICK - Handle notification interactions
// =============================================================================

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  const urlToOpen = event.action === 'answer' || event.action === ''
    ? '/owner'
    : '/owner';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Try to focus an existing window
        for (const client of clientList) {
          if (client.url.includes('/owner') && 'focus' in client) {
            client.postMessage({
              type: 'notification-action',
              action: event.action,
              data: event.notification.data
            });
            return client.focus();
          }
        }
        
        // Open new window if none exists
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// =============================================================================
// NOTIFICATION CLOSE - Handle notification dismissal
// =============================================================================

self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed');
  
  // Could track dismissed notifications here if needed
});

// =============================================================================
// MESSAGE - Handle messages from clients
// =============================================================================

self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// =============================================================================
// SYNC - Background sync (for future use)
// =============================================================================

self.addEventListener('sync', (event) => {
  console.log('[SW] Sync event:', event.tag);
  
  if (event.tag === 'sync-call-history') {
    // Could sync call history to server here
  }
});
