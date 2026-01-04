import { Request, Response } from 'express';
import SocialActivity from '../models/SocialActivity';
import Friendship from '../models/Friendship';

// @desc    Get social activity feed
// @route   GET /api/social/feed
// @access  Private
export const getFeed = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { page = 1, limit = 20 } = req.query;

        // 1. Get list of friends
        const friendships = await Friendship.find({
            $or: [{ requester: userId }, { recipient: userId }],
            status: 'accepted',
        });

        const friendIds = friendships.map((f: any) =>
            f.requester.toString() === userId.toString() ? f.recipient : f.requester
        );

        // Include self in feed? Optional. Let's include self.
        friendIds.push(userId);

        // 2. Fetch activities from friends
        const activities = await SocialActivity.find({
            user: { $in: friendIds }
        })
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit))
            .populate('user', 'profile.name profile.avatar');

        res.json({
            success: true,
            activities
        });
    } catch (error: any) {
        console.error('Error fetching feed:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Helper to create activity (internal use)
export const createActivity = async (userId: string, type: string, data: any) => {
    try {
        await SocialActivity.create({
            user: userId,
            type,
            data
        });
    } catch (error) {
        console.error('Error creating social activity:', error);
    }
};
