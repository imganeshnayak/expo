import { Request, Response } from 'express';
import User from '../models/User';
import Friendship from '../models/Friendship';

// @desc    Get leaderboard
// @route   GET /api/leaderboard
// @access  Private
export const getLeaderboard = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { type = 'global', period = 'all_time' } = req.query;

        let query: any = { isActive: true };

        // If friends only, filter by friend IDs
        if (type === 'friends') {
            const friendships = await Friendship.find({
                $or: [{ requester: userId }, { recipient: userId }],
                status: 'accepted',
            });

            const friendIds = friendships.map(f =>
                f.requester.toString() === userId.toString() ? f.recipient : f.requester
            );

            // Include self in friends leaderboard
            friendIds.push(userId);

            query._id = { $in: friendIds };
        }

        // Fetch users sorted by points (XP)
        // In a real app, you might have a separate Leaderboard collection updated periodically
        // for performance. For now, we aggregate on the fly.
        const users = await User.find(query)
            .select('profile.name profile.avatar gamification.xp.current gamification.streak.current loyaltyPoints')
            .sort({ 'gamification.xp.current': -1 })
            .limit(50);

        const leaderboard = users.map((user, index) => ({
            rank: index + 1,
            userId: user._id,
            userName: user.profile.name,
            userAvatar: user.profile.avatar,
            points: user.gamification.xp.current,
            streak: user.gamification.streak.current,
            totalSavings: user.loyaltyPoints * 10, // Mock savings calculation
            isMe: user._id.toString() === userId.toString(),
        }));

        res.json({ success: true, data: leaderboard });
    } catch (error: any) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
