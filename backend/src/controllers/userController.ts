import { Request, Response } from 'express';
import User from '../models/User';

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
