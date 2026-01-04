import { Request, Response } from 'express';
import User from '../models/User';
import PushNotification from '../models/business/PushNotification';

// @desc    Get user's claimed deals
// @route   GET /api/users/claimed-deals
// @access  Private
export const getClaimedDeals = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;

        const user = await User.findById(userId).populate({
            path: 'claimedDeals.dealId',
            populate: { path: 'merchantId', select: 'name logo' },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const claimedDeals = user.claimedDeals.map((claim: any) => ({
            deal: claim.dealId,
            claimedAt: claim.claimedAt,
            redeemedAt: claim.redeemedAt,
            savings: claim.savings,
            redemptionCode: claim.redemptionCode,
            status: claim.status,
        }));

        res.status(200).json(claimedDeals);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update user push token
// @route   PUT /api/users/push-token
// @access  Private
export const updatePushToken = async (req: Request, res: Response) => {
    try {
        const { pushToken } = req.body;

        if (!pushToken) {
            return res.status(400).json({ message: 'Push token is required' });
        }

        // Basic validation for Expo push token
        if (!pushToken.startsWith('ExponentPushToken') && !pushToken.startsWith('ExpoPushToken')) {
            // Allow mock tokens for testing
            if (!pushToken.includes('TestToken')) {
                return res.status(400).json({ message: 'Invalid Expo push token' });
            }
        }

        const user = await User.findById((req as any).user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.pushToken = pushToken;
        await user.save();

        console.log(`[Push Token] Updated for user ${user.profile.name}: ${pushToken}`);

        res.json({
            success: true,
            message: 'Push token updated successfully'
        });
    } catch (error: any) {
        console.error('Error updating push token:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user notifications
// @route   GET /api/users/notifications
// @access  Private
export const getUserNotifications = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find notifications that target this user
        // 1. Audience is 'all'
        // 2. Audience is 'individual' AND user's ID is in targetUserIds

        const notifications = await PushNotification.find({
            $or: [
                { audience: 'all' },
                {
                    audience: 'individual',
                    targetUserIds: userId
                }
            ],
            status: 'sent' // Only show sent notifications
        })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({
            success: true,
            notifications
        });
    } catch (error: any) {
        console.error('Error fetching user notifications:', error);
        res.status(500).json({ message: error.message });
    }
};
