// Shared notification badge functionality
// Include this script in pages that need notification badge updates

class NotificationBadge {
    constructor() {
        this.API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:3000'
            : 'https://todolist-auth-server.onrender.com';
        
        this.unreadCount = 0;
        this.badgeElement = null;
        this.init();
    }

    init() {
        // Create notification badge if it doesn't exist
        this.createNotificationBadge();
        
        // Load initial unread count
        this.updateUnreadCount();
        
        // Set up auto-refresh
        this.startAutoRefresh();
    }

    createNotificationBadge() {
        const notificationIcon = document.querySelector('img[alt="notifications"]');
        if (!notificationIcon) return;

        // Wrap notification icon in container if not already wrapped
        if (!notificationIcon.parentElement.classList.contains('nav-icon-container')) {
            const container = document.createElement('div');
            container.className = 'nav-icon-container';
            notificationIcon.parentNode.insertBefore(container, notificationIcon);
            container.appendChild(notificationIcon);
        }

        // Create badge element
        if (!this.badgeElement) {
            this.badgeElement = document.createElement('span');
            this.badgeElement.className = 'notification-badge';
            this.badgeElement.style.display = 'none';
            notificationIcon.parentElement.appendChild(this.badgeElement);
        }
    }

    async updateUnreadCount() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                this.hideBadge();
                return;
            }

            const response = await fetch(`${this.API_URL}/notifications/unread-count`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.unreadCount = data.count || 0;
                this.updateBadgeDisplay();
            } else {
                this.hideBadge();
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
            this.hideBadge();
        }
    }

    updateBadgeDisplay() {
        if (!this.badgeElement) return;

        if (this.unreadCount > 0) {
            this.badgeElement.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount.toString();
            this.badgeElement.style.display = 'flex';
            this.badgeElement.title = `${this.unreadCount} unread notification${this.unreadCount !== 1 ? 's' : ''}`;
        } else {
            this.hideBadge();
        }
    }

    hideBadge() {
        if (this.badgeElement) {
            this.badgeElement.style.display = 'none';
        }
    }

    startAutoRefresh() {
        // Update badge every 30 seconds
        setInterval(() => {
            if (document.visibilityState === 'visible') {
                this.updateUnreadCount();
            }
        }, 30000);

        // Update when page becomes visible
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.updateUnreadCount();
            }
        });
    }

    // Method to manually refresh (can be called from other scripts)
    refresh() {
        this.updateUnreadCount();
    }

    // Method to mark notifications as read (decreases count)
    markAsRead(count = 1) {
        this.unreadCount = Math.max(0, this.unreadCount - count);
        this.updateBadgeDisplay();
    }

    // Method to add new notification (increases count)
    addNotification(count = 1) {
        this.unreadCount += count;
        this.updateBadgeDisplay();
    }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if user is logged in and we're not on the notifications page
    const token = localStorage.getItem('token');
    const isNotificationsPage = window.location.pathname.includes('Notifications.html');
    
    if (token && !isNotificationsPage) {
        window.notificationBadge = new NotificationBadge();
    }
});

// Make it globally available
window.NotificationBadge = NotificationBadge;