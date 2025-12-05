import { Request, Response } from 'express';
import User from '../models/User';
import PointTransaction from '../models/PointTransaction';
import Mission from '../models/Mission';
import { addXP, queueXP, claimXP } from '../services/GamificationService';

// @desc    Get loyalty profile (points, level, history)
// @route   GET /api/loyalty
// @access  Private
export const getLoyaltyProfile = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.user?._id).select('loyaltyPoints loyaltyLevel');
        const history = await PointTransaction.find({ userId: req.user?._id })
            .sort({ createdAt: -1 })
            .limit(10);

        res.status(200).json({
            points: user?.loyaltyPoints,
            level: user?.loyaltyLevel,
            history,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get available missions
// @route   GET /api/loyalty/missions
// @access  Private
export const getMissions = async (req: Request, res: Response) => {
    try {
        const missions = await Mission.find({ isActive: true });
        res.status(200).json(missions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Claim mission reward (Mock logic)
// @route   POST /api/loyalty/claim/:missionId
// @access  Private
export const claimReward = async (req: Request, res: Response) => {
    try {
        const mission = await Mission.findById(req.params.missionId);
        if (!mission) {
            return res.status(404).json({ message: 'Mission not found' });
        }

        // In real app, check if user met requirements (e.g., count rides)
        // For now, we assume they did and just award points

        const user = await User.findById(req.user?._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Add points
        user.loyaltyPoints += mission.rewardPoints;

        // Update Level Logic (Simple)
        if (user.loyaltyPoints > 1000) user.loyaltyLevel = 'Platinum';
        else if (user.loyaltyPoints > 500) user.loyaltyLevel = 'Gold';
        else if (user.loyaltyPoints > 200) user.loyaltyLevel = 'Silver';

        await user.save();

        // Record Transaction
        await PointTransaction.create({
            userId: user._id,
            type: 'earn',
            amount: mission.rewardPoints,
            description: `Completed mission: ${mission.title}`,
            source: 'mission',
            referenceId: mission._id.toString(),
        });

        res.status(200).json({
            message: 'Reward claimed',
            points: user.loyaltyPoints,
            level: user.loyaltyLevel
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a mission (For testing/admin)
// @route   POST /api/loyalty/missions
// @access  Private
export const createMission = async (req: Request, res: Response) => {
    try {
        const mission = await Mission.create(req.body);
        res.status(201).json(mission);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
// @desc    Get gamification profile (XP, Rank, Unlocks)
// @route   GET /api/loyalty/gamification
// @access  Private
export const getGamificationProfile = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.user?._id).select('gamification');
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Initialize if missing
        if (!user.gamification || !user.gamification.xp) {
            // This should ideally be handled by a migration or the service, but for safety:
            user.gamification = {
                xp: { current: 0, lifetime: 0 },
                rank: { league: 'Bronze', tier: 1, displayName: 'Bronze I' },
                streak: { current: 0, lastActiveDate: new Date() },
                unlockedFeatures: [],
                skillTree: new Map(),
                pendingRewards: [],
            };
            await user.save();
        }

        res.status(200).json(user.gamification);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Trigger a gamification action (Dev/Test)
// @route   POST /api/loyalty/action
// @access  Private
export const triggerAction = async (req: Request, res: Response) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const { amount, source } = req.body;
        // Queue XP instead of adding directly
        const result = await queueXP(req.user._id.toString(), amount, source, `Action: ${source}`);
        res.status(200).json({ message: 'XP Queued', pendingRewards: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get pending XP rewards
// @route   GET /api/loyalty/gamification/rewards/pending
// @access  Private
export const getPendingRewards = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.user?._id).select('gamification.pendingRewards');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json(user.gamification.pendingRewards || []);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Claim a pending XP reward
// @route   POST /api/loyalty/gamification/rewards/:rewardId/claim
// @access  Private
export const claimXPReward = async (req: Request, res: Response) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const result = await claimXP(req.user._id.toString(), req.params.rewardId);

        res.status(200).json(result);
    } catch (error: any) {
        console.error(error);
        if (error.message === 'Reward not found') {
            return res.status(404).json({ message: 'Reward not found' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Daily Check-in (24-hour cooldown)
// @route   POST /api/loyalty/checkin
// @access  Private
export const dailyCheckIn = async (req: Request, res: Response) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Check if user has already checked in within the last 24 hours
        const now = new Date();
        const lastCheckIn = user.gamification.lastDailyCheckIn;

        if (lastCheckIn) {
            const hoursSinceLastCheckIn = (now.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60);

            if (hoursSinceLastCheckIn < 24) {
                const hoursRemaining = 24 - hoursSinceLastCheckIn;
                const minutesRemaining = Math.ceil(hoursRemaining * 60);

                return res.status(400).json({
                    message: 'Already checked in today',
                    canCheckInAt: new Date(lastCheckIn.getTime() + 24 * 60 * 60 * 1000),
                    hoursRemaining: Math.floor(hoursRemaining),
                    minutesRemaining: minutesRemaining % 60,
                });
            }
        }

        // Update last check-in time
        user.gamification.lastDailyCheckIn = now;

        // Update streak
        if (lastCheckIn) {
            const daysSinceLastCheckIn = (now.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60 * 24);

            if (daysSinceLastCheckIn <= 1.5) {
                // Within grace period, increment streak
                user.gamification.streak.current += 1;
            } else {
                // Streak broken, reset to 1
                user.gamification.streak.current = 1;
            }
        } else {
            // First check-in
            user.gamification.streak.current = 1;
        }

        user.gamification.streak.lastActiveDate = now;
        await user.save();

        // Queue XP reward (10 XP for daily check-in)
        const XP_AMOUNT = 10;
        const result = await queueXP(
            req.user._id.toString(),
            XP_AMOUNT,
            'daily_checkin',
            `Daily Check-in Day ${user.gamification.streak.current}`
        );

        res.status(200).json({
            message: 'Check-in successful!',
            streak: user.gamification.streak.current,
            xpEarned: XP_AMOUNT,
            nextCheckInAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
            pendingRewards: result,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get daily check-in status
// @route   GET /api/loyalty/checkin/status
// @access  Private
export const getCheckInStatus = async (req: Request, res: Response) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const user = await User.findById(req.user._id).select('gamification.lastDailyCheckIn gamification.streak');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const now = new Date();
        const lastCheckIn = user.gamification.lastDailyCheckIn;

        let canCheckIn = true;
        let nextCheckInAt = null;
        let hoursRemaining = 0;
        let minutesRemaining = 0;

        if (lastCheckIn) {
            const hoursSinceLastCheckIn = (now.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60);

            if (hoursSinceLastCheckIn < 24) {
                canCheckIn = false;
                nextCheckInAt = new Date(lastCheckIn.getTime() + 24 * 60 * 60 * 1000);
                hoursRemaining = Math.floor(24 - hoursSinceLastCheckIn);
                minutesRemaining = Math.ceil((24 - hoursSinceLastCheckIn) * 60) % 60;
            }
        }

        res.status(200).json({
            canCheckIn,
            lastCheckIn,
            nextCheckInAt,
            hoursRemaining,
            minutesRemaining,
            currentStreak: user.gamification.streak.current,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

