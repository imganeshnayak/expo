import { Request, Response } from 'express';
import User from '../models/User';
import crypto from 'crypto';

// Helper to generate unique referral code
const generateUniqueCode = async (name: string): Promise<string> => {
    const base = name.replace(/[^a-zA-Z]/g, '').toUpperCase().substring(0, 4);
    const random = crypto.randomBytes(2).toString('hex').toUpperCase();
    const code = `UTOPIA-${base}-${random}`;

    // Check uniqueness
    const existing = await User.findOne({ referralCode: code });
    if (existing) return generateUniqueCode(name);

    return code;
};

// @desc    Get my referral code and stats
// @route   GET /api/referrals/me
// @access  Private
export const getMyReferral = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        let user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate code if not exists
        if (!(user as any).referralCode) {
            (user as any).referralCode = await generateUniqueCode((user as any).profile.name);
            await user.save();
        }

        // Get referral stats
        // Find users who were referred by this user's code
        const referredUsers = await User.find({ referredBy: (user as any).referralCode })
            .select('profile.name profile.avatar createdAt email phone');

        const stats = {
            code: (user as any).referralCode,
            totalReferrals: referredUsers.length,
            totalEarnings: referredUsers.length * 100, // Mock calculation: 100 per referral
            referrals: referredUsers.map(u => ({
                id: u._id,
                name: u.profile.name,
                joinedAt: u.createdAt,
                status: 'joined', // Simplified status
                earnings: 100
            }))
        };

        res.json({ success: true, data: stats });
    } catch (error: any) {
        console.error('Error fetching referral data:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Apply referral code
// @route   POST /api/referrals/apply
// @access  Private
export const applyReferralCode = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ message: 'Referral code is required' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.referredBy) {
            return res.status(400).json({ message: 'Referral code already applied' });
        }

        if ((user as any).referralCode === code) {
            return res.status(400).json({ message: 'Cannot apply your own code' });
        }

        const referrer = await User.findOne({ referralCode: code });
        if (!referrer) {
            return res.status(404).json({ message: 'Invalid referral code' });
        }

        user.referredBy = code;
        await user.save();

        // Here you would typically trigger rewards, notifications, etc.

        res.json({ success: true, message: 'Referral code applied successfully' });
    } catch (error: any) {
        console.error('Error applying referral code:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
