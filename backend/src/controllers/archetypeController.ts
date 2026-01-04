import { Request, Response } from 'express';
import User from '../models/User';

// @desc    Set user archetype
// @route   POST /api/archetype
// @access  Private
export const setArchetype = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { archetype } = req.body;

        if (!archetype) {
            return res.status(400).json({ message: 'Archetype is required' });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { archetype },
            { new: true }
        ).select('profile archetype');

        res.json({ success: true, data: user });
    } catch (error: any) {
        console.error('Error setting archetype:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user archetype
// @route   GET /api/archetype
// @access  Private
export const getArchetype = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const user = await User.findById(userId).select('archetype');

        res.json({ success: true, data: { archetype: (user as any)?.archetype } });
    } catch (error: any) {
        console.error('Error fetching archetype:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
