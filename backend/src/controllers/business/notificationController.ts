import { Request, Response } from 'express';
import Notification from '../../models/business/Notification';

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req: Request, res: Response) => {
    try {
        const merchantId = req.user?.merchantId;
        const { limit = 50, unreadOnly = false } = req.query;

        const query: any = { merchantId };
        if (unreadOnly === 'true') {
            query.read = false;
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit));

        const unreadCount = await Notification.countDocuments({ merchantId, read: false });

        res.json({
            success: true,
            notifications,
            unreadCount,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark notification as read
// @route   POST /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req: Request, res: Response) => {
    try {
        const merchantId = req.user?.merchantId;
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, merchantId },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({
            success: true,
            notification,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark all notifications as read
// @route   POST /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req: Request, res: Response) => {
    try {
        const merchantId = req.user?.merchantId;
        await Notification.updateMany(
            { merchantId, read: false },
            { read: true }
        );

        res.json({
            success: true,
            message: 'All notifications marked as read',
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req: Request, res: Response) => {
    try {
        const merchantId = req.user?.merchantId;
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            merchantId,
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({
            success: true,
            message: 'Notification deleted',
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Clear all notifications
// @route   DELETE /api/notifications
// @access  Private
export const clearAllNotifications = async (req: Request, res: Response) => {
    try {
        const merchantId = req.user?.merchantId;
        await Notification.deleteMany({ merchantId });

        res.json({
            success: true,
            message: 'All notifications cleared',
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create notification (internal use)
export const createNotification = async (
    merchantId: any,
    type: string,
    priority: string,
    title: string,
    message: string,
    metadata?: any
) => {
    try {
        await Notification.create({
            merchantId,
            type,
            priority,
            title,
            message,
            metadata,
        });
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};
