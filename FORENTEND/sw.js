// Service Worker for Push Notifications
// This handles background push notifications when the app is closed

self.addEventListener('install', event => {
    console.log('TodoList Service Worker installing...');
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log('TodoList Service Worker activating...');
    event.waitUntil(self.clients.claim());
});

// Handle push notifications
self.addEventListener('push', event => {
    console.log('Push event received:', event);
    
    const defaultOptions = {
        icon: 'https://img.icons8.com/3d-fluency/94/checked--v1.png',
        badge: 'https://img.icons8.com/3d-fluency/94/notification.png',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        actions: [
            {
                action: 'view',
                title: '👀 View',
                icon: 'https://img.icons8.com/3d-fluency/32/eye.png'
            },
            {
                action: 'dismiss',
                title: '✖️ Dismiss',
                icon: 'https://img.icons8.com/3d-fluency/32/cancel.png'
            }
        ],
        data: {
            url: '/HomeTools/Notifications.html',
            timestamp: Date.now()
        }
    };

    let notificationOptions = defaultOptions;
    
    if (event.data) {
        try {
            const payload = event.data.json();
            notificationOptions = {
                ...defaultOptions,
                title: payload.title || 'Todo List Notification',
                body: payload.message || payload.body || 'You have a new notification',
                tag: payload.tag || 'todo-notification',
                data: {
                    ...defaultOptions.data,
                    ...payload.data
                }
            };
        } catch (e) {
            console.error('Error parsing push payload:', e);
            notificationOptions.title = 'Todo List Notification';
            notificationOptions.body = event.data.text() || 'You have a new notification';
        }
    } else {
        notificationOptions.title = 'Todo List Notification';
        notificationOptions.body = 'You have a new notification';
    }

    event.waitUntil(
        self.registration.showNotification(notificationOptions.title, notificationOptions)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    console.log('Notification clicked:', event);
    
    event.notification.close();
    
    const action = event.action;
    const notificationData = event.notification.data || {};
    
    if (action === 'dismiss') {
        // Just close the notification
        return;
    }
    
    // Default action or 'view' action - open the app
    const urlToOpen = notificationData.url || '/HomeTools/Notifications.html';
    
    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then(clientList => {
            // Check if the app is already open
            for (const client of clientList) {
                if (client.url.includes('TodoList') && 'focus' in client) {
                    // Navigate to notifications page if app is already open
                    client.postMessage({
                        type: 'NAVIGATE_TO_NOTIFICATIONS',
                        data: notificationData
                    });
                    return client.focus();
                }
            }
            
            // Open new window if app is not open
            if (clients.openWindow) {
                const fullUrl = self.location.origin + urlToOpen;
                return clients.openWindow(fullUrl);
            }
        })
    );
});

// Handle notification close
self.addEventListener('notificationclose', event => {
    console.log('Notification closed:', event.notification.tag);
    
    // Optional: Track notification dismissals
    const notificationData = event.notification.data || {};
    if (notificationData.trackDismissal) {
        // Could send analytics or update read status
        console.log('Notification dismissed:', notificationData);
    }
});

// Handle messages from the main app
self.addEventListener('message', event => {
    console.log('Service Worker received message:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({
            version: '1.0.0',
            timestamp: Date.now()
        });
    }
});

// Background sync for offline notifications (if supported)
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync-notifications') {
        console.log('Background sync: notifications');
        event.waitUntil(syncNotifications());
    }
});

async function syncNotifications() {
    try {
        // This would sync any pending notifications when back online
        console.log('Syncing notifications in background...');
        
        // In a real implementation, you might:
        // 1. Check for pending notifications in IndexedDB
        // 2. Send them to the server
        // 3. Show any new notifications received while offline
        
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Cleanup old notifications periodically
function cleanupOldNotifications() {
    self.registration.getNotifications().then(notifications => {
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        notifications.forEach(notification => {
            const notificationTime = notification.data && notification.data.timestamp;
            if (notificationTime && (now - notificationTime) > maxAge) {
                notification.close();
            }
        });
    });
}

// Run cleanup every hour
setInterval(cleanupOldNotifications, 60 * 60 * 1000);