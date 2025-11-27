import { Request, Response } from 'express';
import User from '../models/User';
import PointTransaction from '../models/PointTransaction';
import Mission from '../models/Mission';

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
