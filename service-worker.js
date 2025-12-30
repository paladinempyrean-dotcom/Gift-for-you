// Service Worker for Daily Love Messages PWA
const CACHE_NAME = 'love-messages-v1';
const urlsToCache = [
  '/Gift-for-you/',
  '/Gift-for-you/index.html',
  '/Gift-for-you/manifest.json'
];

// Install event - cache files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

// Background sync for notifications (when device comes online)
self.addEventListener('sync', event => {
  if (event.tag === 'daily-love-message') {
    event.waitUntil(sendDailyNotification());
  }
});

// Periodic background sync (for daily notifications)
self.addEventListener('periodicsync', event => {
  if (event.tag === 'daily-love-check') {
    event.waitUntil(checkAndSendDailyMessage());
  }
});

// Function to check and send daily message
async function checkAndSendDailyMessage() {
  const now = new Date();
  const phTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
  const hours = phTime.getHours();
  const minutes = phTime.getMinutes();
  
  // Check if it's 6:00 AM Philippines time (within 5 minute window)
  if (hours === 6 && minutes < 5) {
    await sendDailyNotification();
  }
}

// Function to send notification
async function sendDailyNotification() {
  const compliments = [
    "Your smile makes my entire day brighter! ☀️",
    "You're the most beautiful person inside and out! 🌸",
    "Your laugh is my favorite sound in the world! 🎵",
    "You make everything better just by being you! ✨",
    "I fall in love with you more every single day! 💕",
    "Your kindness touches everyone around you! 🌟",
    "You're my favorite person to talk to! 💬",
    "Your intelligence and wit never cease to amaze me! 🧠",
    "You have the biggest, most beautiful heart! 💖",
    "I'm so lucky to have you in my life! 🍀",
    "Good morning beautiful! You're the first thing I think about every day! 🌅",
    "Your voice is like music to my ears! 🎶",
    "I love how you light up when you talk about your passions! 🔥",
    "Your hugs feel like home to me! 🏡",
    "You have an amazing way of making everyone feel special! ⭐",
    "I admire your courage and determination! 💪",
    "Your sense of humor brightens even the gloomiest days! 😄",
    "You're incredibly talented and I'm so proud of you! 🎨",
    "The way you care for others is truly beautiful! 💝",
    "I love your quirky little habits - they're adorable! 🥰"
  ];
  
  // Get day of year for consistent message
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = new Date() - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const todaysCompliment = compliments[dayOfYear % compliments.length];
  
  // Send notification
  const notification = await self.registration.showNotification('💝 Good Morning Beautiful!', {
    body: todaysCompliment,
    icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ctext y="75" font-size="75"%3E💕%3C/text%3E%3C/svg%3E',
    badge: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ctext y="75" font-size="75"%3E💖%3C/text%3E%3C/svg%3E',
    vibrate: [200, 100, 200],
    tag: 'daily-love-message',
    requireInteraction: true,
    actions: [
      { action: 'open', title: 'Open App 💕' },
      { action: 'close', title: 'Close' }
    ]
  });
  
  return notification;
}

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/Gift-for-you/')
    );
  }
});

// Listen for messages from main app
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SEND_TEST_NOTIFICATION') {
    sendDailyNotification();
  }
});
