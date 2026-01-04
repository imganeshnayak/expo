import { api } from '../../lib/api';

export interface SendNotificationRequest {
    title: string;
    message: string;
    audience: 'all' | 'segment' | 'individual';
    targetSegments?: string[];
    targetUserIds?: string[];
}

export interface PushNotification {
    id: string;
    merchantId: string;
    title: string;
    message: string;
    audience: 'all' | 'segment' | 'individual';
    targetSegments?: string[];
    sentCount: number;
    deliveredCount: number;
    failedCount: number;
    status: 'draft' | 'sending' | 'sent' | 'failed';
    createdAt: string;
    sentAt?: string;
}

export interface NotificationStats {
    totalNotifications: number;
    totalSent: number;
    totalDelivered: number;
    totalFailed: number;
}

export const notificationService = {
    // Send push notification
    async sendNotification(data: SendNotificationRequest): Promise<any> {
        return await api.post<any>('/api/push-notifications', data);
    },

    // Get notification history
    async getHistory(limit: number = 50): Promise<any> {
        return await api.get<any>(`/api/push-notifications?limit=${limit}`);
    },

    // Get notification statistics
    async getStats(): Promise<any> {
        return await api.get<any>('/api/push-notifications/stats');
    },
};
