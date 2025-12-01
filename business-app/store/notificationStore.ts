import { create } from 'zustand';

export type NotificationType = 'campaign' | 'customer' | 'system' | 'alert';
export type NotificationPriority = 'high' | 'medium' | 'low';

export interface Notification {
    id: string;
    type: NotificationType;
    priority: NotificationPriority;
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    actionUrl?: string;
    metadata?: {
        campaignId?: string;
        customerId?: string;
        amount?: number;
    };
}

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;

    // Actions
    markAsRead: (id: string) => void;
    markAsUnread: (id: string) => void;
    markAllAsRead: () => void;
    deleteNotification: (id: string) => void;
    clearAll: () => void;
    getUnreadCount: () => number;
}

// Hardcoded notifications for demo
const generateHardcodedNotifications = (): Notification[] => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return [
        {
            id: 'notif_1',
            type: 'campaign',
            priority: 'high',
            title: 'Campaign Performance Alert',
            message: 'Your "Weekend Special" campaign has exceeded its daily budget by 15%',
            timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
            read: false,
            metadata: { campaignId: 'camp_1', amount: 150 },
        },
        {
            id: 'notif_2',
            type: 'customer',
            priority: 'medium',
            title: 'New VIP Customer',
            message: 'Sarah Johnson has been promoted to VIP status after 10 visits',
            timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000), // 5 hours ago
            read: false,
            metadata: { customerId: 'cust_sarah_johnson' },
        },
        {
            id: 'notif_3',
            type: 'campaign',
            priority: 'medium',
            title: 'Campaign Milestone Reached',
            message: '"Happy Hour Promo" has reached 100 conversions! 🎉',
            timestamp: yesterday,
            read: false,
            metadata: { campaignId: 'camp_2' },
        },
        {
            id: 'notif_4',
            type: 'system',
            priority: 'low',
            title: 'Weekly Report Ready',
            message: 'Your weekly business analytics report is now available',
            timestamp: yesterday,
            read: true,
        },
        {
            id: 'notif_5',
            type: 'customer',
            priority: 'high',
            title: 'At-Risk Customer Alert',
            message: '5 customers haven\'t visited in 30+ days. Send them a win-back offer?',
            timestamp: twoDaysAgo,
            read: false,
        },
        {
            id: 'notif_6',
            type: 'alert',
            priority: 'high',
            title: 'Low Campaign Budget',
            message: '"Loyalty Rewards" campaign has only $50 remaining in budget',
            timestamp: twoDaysAgo,
            read: true,
            metadata: { campaignId: 'camp_3', amount: 50 },
        },
        {
            id: 'notif_7',
            type: 'campaign',
            priority: 'medium',
            title: 'Campaign Completed',
            message: '"Summer Sale" campaign has ended. View final results.',
            timestamp: threeDaysAgo,
            read: true,
            metadata: { campaignId: 'camp_4' },
        },
        {
            id: 'notif_8',
            type: 'customer',
            priority: 'low',
            title: 'Customer Feedback',
            message: 'You received 3 new 5-star reviews this week',
            timestamp: threeDaysAgo,
            read: true,
        },
        {
            id: 'notif_9',
            type: 'system',
            priority: 'medium',
            title: 'New Feature Available',
            message: 'Try our new AI-powered campaign optimizer to boost ROI',
            timestamp: oneWeekAgo,
            read: true,
        },
        {
            id: 'notif_10',
            type: 'campaign',
            priority: 'low',
            title: 'Campaign Suggestion',
            message: 'Based on your data, we recommend creating a "Rainy Day Special" campaign',
            timestamp: oneWeekAgo,
            read: true,
        },
    ];
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: generateHardcodedNotifications(),
    unreadCount: generateHardcodedNotifications().filter(n => !n.read).length,

    markAsRead: (id: string) => {
        set(state => ({
            notifications: state.notifications.map(n =>
                n.id === id ? { ...n, read: true } : n
            ),
            unreadCount: state.notifications.filter(n => !n.read && n.id !== id).length,
        }));
    },

    markAsUnread: (id: string) => {
        set(state => ({
            notifications: state.notifications.map(n =>
                n.id === id ? { ...n, read: false } : n
            ),
            unreadCount: state.notifications.filter(n => !n.read).length + 1,
        }));
    },

    markAllAsRead: () => {
        set(state => ({
            notifications: state.notifications.map(n => ({ ...n, read: true })),
            unreadCount: 0,
        }));
    },

    deleteNotification: (id: string) => {
        set(state => {
            const notification = state.notifications.find(n => n.id === id);
            return {
                notifications: state.notifications.filter(n => n.id !== id),
                unreadCount: notification && !notification.read
                    ? state.unreadCount - 1
                    : state.unreadCount,
            };
        });
    },

    clearAll: () => {
        set({ notifications: [], unreadCount: 0 });
    },

    getUnreadCount: () => get().unreadCount,
}));

// Helper functions
export const getNotificationIcon = (type: NotificationType): string => {
    switch (type) {
        case 'campaign': return 'rocket';
        case 'customer': return 'users';
        case 'system': return 'settings';
        case 'alert': return 'alert-circle';
        default: return 'bell';
    }
};

export const getNotificationColor = (priority: NotificationPriority): string => {
    switch (priority) {
        case 'high': return '#E74C3C';
        case 'medium': return '#F39C12';
        case 'low': return '#3498DB';
        default: return '#95A5A6';
    }
};

export const formatNotificationTime = (timestamp: Date): string => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
};
