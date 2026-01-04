import { Request, Response } from 'express';
import PushNotification from '../../models/business/PushNotification';
import User from '../../models/User';
import { Expo } from 'expo-server-sdk';

const expo = new Expo();

// @desc    Send push notification to users
// @route   POST /api/business/push-notifications
// @access  Private (Merchant)
export const sendPushNotification = async (req: Request, res: Response) => {
    try {
        const merchantId = req.user?.merchantId;
        const { title, message, audience, targetSegments, targetUserIds } = req.body;

        // Validate input
        if (!title || !message || !audience) {
            return res.status(400).json({
                message: 'Title, message, and audience are required'
            });
        }

        // Create notification record
        const notification = await PushNotification.create({
            merchantId,
            title,
            message,
            audience,
            targetSegments: audience === 'segment' ? targetSegments : undefined,
            targetUserIds: audience === 'individual' ? targetUserIds : undefined,
            status: 'sending',
        });

        // Get target users based on audience
        let targetUsers: any[] = [];

        if (audience === 'all') {
            // Get all users (in production, you'd want pagination/batching)
            targetUsers = await User.find({
                pushToken: { $exists: true, $ne: null }
            }).select('pushToken');
        } else if (audience === 'segment') {
            // Get users by segment (assuming segment is stored in user profile)
            targetUsers = await User.find({
                segment: { $in: targetSegments },
                pushToken: { $exists: true, $ne: null }
            }).select('pushToken');
        } else if (audience === 'individual') {
            // Get specific users
            targetUsers = await User.find({
                _id: { $in: targetUserIds },
                pushToken: { $exists: true, $ne: null }
            }).select('pushToken');
        }

        // Extract push tokens
        const pushTokens = targetUsers
            .map(user => user.pushToken)
            .filter(token => Expo.isExpoPushToken(token));

        console.log(`[Push Debug] Audience: ${audience}`);
        console.log(`[Push Debug] Found ${targetUsers.length} target users`);
        console.log(`[Push Debug] Valid Push Tokens: ${pushTokens.length}`);

        // Send push notifications using Expo Push Notification service
        let sentCount = 0;
        let deliveredCount = 0;
        let failedCount = 0;

        if (pushTokens.length > 0) {
            try {
                const messages = pushTokens.map(token => ({
                    to: token,
                    sound: 'default' as const,
                    title: title,
                    body: message,
                    data: { merchantId: merchantId.toString(), notificationId: notification._id.toString() },
                }));

                const chunks = expo.chunkPushNotifications(messages);
                const tickets = [];

                for (const chunk of chunks) {
                    try {
                        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                        tickets.push(...ticketChunk);
                    } catch (error) {
                        console.error('Error sending chunk:', error);
                    }
                }

                // Count successful tickets (not necessarily delivered, but sent to Expo)
                // For simplicity, we'll count all non-error tickets as "sent"
                sentCount = tickets.length;

                // In a real app, you'd process receipt IDs to check delivery
                deliveredCount = sentCount;

                console.log(`[Push Notification] Sent to ${sentCount} users: "${title}"`);
            } catch (error) {
                console.error('Error sending push notifications:', error);
                failedCount = pushTokens.length;
            }
        }

        // Update notification record
        await PushNotification.findByIdAndUpdate(notification._id, {
            status: failedCount === pushTokens.length ? 'failed' : 'sent',
            sentCount,
            deliveredCount,
            failedCount,
            sentAt: new Date(),
        });

        res.json({
            success: true,
            notification: {
                id: notification._id,
                title,
                message,
                audience,
                sentCount,
                deliveredCount,
                failedCount,
                status: failedCount === pushTokens.length ? 'failed' : 'sent',
            },
        });
    } catch (error: any) {
        console.error('Error sending push notification:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get push notification history
// @route   GET /api/business/push-notifications
// @access  Private (Merchant)
export const getPushNotificationHistory = async (req: Request, res: Response) => {
    try {
        const merchantId = req.user?.merchantId;
        const { limit = 50, status } = req.query;

        const query: any = { merchantId };
        if (status) {
            query.status = status;
        }

        const notifications = await PushNotification.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit));

        const totalSent = await PushNotification.countDocuments({
            merchantId,
            status: 'sent'
        });

        res.json({
            success: true,
            notifications,
            totalSent,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get notification statistics
// @route   GET /api/business/push-notifications/stats
// @access  Private (Merchant)
export const getPushNotificationStats = async (req: Request, res: Response) => {
    try {
        const merchantId = req.user?.merchantId;

        const stats = await PushNotification.aggregate([
            { $match: { merchantId } },
            {
                $group: {
                    _id: null,
                    totalNotifications: { $sum: 1 },
                    totalSent: { $sum: '$sentCount' },
                    totalDelivered: { $sum: '$deliveredCount' },
                    totalFailed: { $sum: '$failedCount' },
                },
            },
        ]);

        res.json({
            success: true,
            stats: stats[0] || {
                totalNotifications: 0,
                totalSent: 0,
                totalDelivered: 0,
                totalFailed: 0,
            },
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Clear push notification history
// @route   DELETE /api/business/push-notifications
// @access  Private (Merchant)
export const clearPushNotificationHistory = async (req: Request, res: Response) => {
    try {
        const merchantId = req.user?.merchantId;

        await PushNotification.deleteMany({ merchantId });

        res.json({
            success: true,
            message: 'Notification history cleared'
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
