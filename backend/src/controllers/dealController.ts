import { Request, Response } from 'express';
import Campaign from '../models/business/Campaign';
import Merchant from '../models/Merchant';
import User from '../models/User';

// @desc    Get all deals (active campaigns)
// @route   GET /api/deals
// @access  Public
export const getDeals = async (req: Request, res: Response) => {
    try {
        // Fetch active campaigns that are discount or combo types
        const campaigns = await Campaign.find({
            status: 'active',
            type: { $in: ['discount', 'combo', 'ride_reimbursement'] },
            // Ensure schedule is valid if present
            $or: [
                { 'targeting.timing': 'always' },
                {
                    'targeting.timing': 'schedule',
                    'targeting.schedule.endDate': { $gte: new Date() }
                }
            ]
        })
            .populate('merchantId', 'name logo')
            .sort({ createdAt: -1 });

        const mappedDeals = campaigns.map((c: any) => ({
            _id: c._id,
            merchantId: c.merchantId,
            title: c.title || c.name,
            description: c.description || '',
            category: c.consumerCategory || c.category,
            originalPrice: c.pricing?.originalPrice || 0,
            discountedPrice: c.pricing?.discountedPrice || 0,
            discountPercentage: c.offer?.discountPercent || 0,
            validFrom: c.targeting?.schedule?.startDate || c.createdAt,
            validUntil: c.targeting?.schedule?.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
            termsAndConditions: c.termsAndConditions || [],
            maxRedemptions: c.maxRedemptions,
            currentRedemptions: c.performance?.conversions || 0,
            isActive: c.status === 'active',
            images: c.images || [],
            createdAt: c.createdAt,
        }));

        res.status(200).json(mappedDeals);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get deal by ID
// @route   GET /api/deals/:id
// @access  Public
export const getDealById = async (req: Request, res: Response) => {
    try {
        const campaign = await Campaign.findById(req.params.id).populate('merchantId');

        if (!campaign) {
            return res.status(404).json({ message: 'Deal not found' });
        }

        const c: any = campaign;
        const mappedDeal = {
            _id: c._id,
            merchantId: c.merchantId,
            title: c.title || c.name,
            description: c.description || '',
            category: c.consumerCategory || c.category,
            originalPrice: c.pricing?.originalPrice || 0,
            discountedPrice: c.pricing?.discountedPrice || 0,
            discountPercentage: c.offer?.discountPercent || 0,
            validFrom: c.targeting?.schedule?.startDate || c.createdAt,
            validUntil: c.targeting?.schedule?.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            termsAndConditions: c.termsAndConditions || [],
            maxRedemptions: c.maxRedemptions,
            currentRedemptions: c.performance?.conversions || 0,
            isActive: c.status === 'active',
            images: c.images || [],
            createdAt: c.createdAt,
        };

        res.status(200).json(mappedDeal);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a deal (for testing/merchants)
// @route   POST /api/deals
// @access  Private (should be Merchant/Admin only)
export const createDeal = async (req: Request, res: Response) => {
    try {
        // For simplicity, we'll create a dummy merchant if one doesn't exist
        let merchant = await Merchant.findOne();
        if (!merchant) {
            merchant = await Merchant.create({
                name: 'Demo Merchant',
                description: 'Best deals in town',
                category: ['Food', 'Retail'],
                contact: { email: 'demo@merchant.com', phone: '9876543210' },
                location: { address: 'Bangalore', coordinates: { latitude: 12.9716, longitude: 77.5946 } }
            });
        }

        // Create a Campaign instead of Deal
        const campaign = await Campaign.create({
            merchantId: merchant._id,
            name: req.body.title,
            type: 'discount',
            status: 'active',
            category: 'acquisition',
            budget: { total: 10000, spent: 0 },
            targeting: { audience: 'all', timing: 'always' },
            offer: { discountPercent: req.body.discountPercentage },
            // Frontend fields
            title: req.body.title,
            description: req.body.description,
            consumerCategory: req.body.category,
            pricing: {
                originalPrice: req.body.originalPrice,
                discountedPrice: req.body.discountedPrice,
            },
            images: req.body.images,
            termsAndConditions: req.body.termsAndConditions,
            maxRedemptions: req.body.maxRedemptions,
        });

        res.status(201).json(campaign);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Claim a deal
// @route   POST /api/deals/:id/claim
// @access  Private
export const claimDeal = async (req: Request, res: Response) => {
    try {
        const dealId = req.params.id;
        const userId = (req as any).user._id; // From auth middleware

        // Find the campaign (deal)
        const campaign: any = await Campaign.findById(dealId);
        if (!campaign || campaign.status !== 'active') {
            return res.status(404).json({ message: 'Deal not found or inactive' });
        }

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if already claimed
        const alreadyClaimed = user.claimedDeals?.some(
            (claim: any) => claim.dealId.toString() === dealId
        );
        if (alreadyClaimed) {
            return res.status(400).json({ message: 'Deal already claimed' });
        }

        // Generate unique redemption code (for QR)
        const redemptionCode = `${userId.toString().slice(-6)}-${dealId.toString().slice(-6)}-${Date.now().toString().slice(-6)}`;

        // Calculate savings safely
        const originalPrice = campaign.pricing?.originalPrice || 0;
        const discountedPrice = campaign.pricing?.discountedPrice || 0;
        const savings = originalPrice - discountedPrice;

        // Add to user's claimed deals
        user.claimedDeals = user.claimedDeals || [];
        user.claimedDeals.push({
            dealId: campaign._id,
            claimedAt: new Date(),
            savings,
            redemptionCode,
            status: 'pending',
        } as any);
        await user.save();

        // Update campaign analytics - claims
        campaign.performance = campaign.performance || { conversions: 0, claims: 0 };
        campaign.performance.claims = (campaign.performance.claims || 0) + 1;
        await campaign.save();

        res.status(200).json({
            message: 'Deal claimed successfully',
            deal: campaign,
            savings: campaign.pricing.originalPrice - campaign.pricing.discountedPrice,
            redemptionCode,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Redeem a deal (Merchant verification)
// @route   POST /api/deals/redeem
// @access  Private (Merchant)
export const redeemDeal = async (req: Request, res: Response) => {
    try {
        const { redemptionCode } = req.body;
        const merchantId = (req as any).user._id; // Merchant user from auth

        // Find user with this redemption code
        const user = await User.findOne({
            'claimedDeals.redemptionCode': redemptionCode,
        }).populate('claimedDeals.dealId');

        if (!user) {
            return res.status(404).json({ message: 'Invalid redemption code' });
        }

        // Find the specific claimed deal
        const claimedDeal = user.claimedDeals.find(
            (claim: any) => claim.redemptionCode === redemptionCode
        );

        if (!claimedDeal) {
            return res.status(404).json({ message: 'Deal not found' });
        }

        // Check if already redeemed
        if (claimedDeal.status === 'redeemed') {
            return res.status(400).json({ message: 'Deal already redeemed' });
        }

        // Verify merchant owns this deal
        const campaign: any = await Campaign.findById(claimedDeal.dealId);
        if (campaign.merchantId.toString() !== merchantId.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Mark as redeemed
        claimedDeal.status = 'redeemed';
        claimedDeal.redeemedAt = new Date();
        await user.save();

        // Update campaign analytics - actual redemptions
        campaign.performance.conversions = (campaign.performance.conversions || 0) + 1;
        await campaign.save();

        res.status(200).json({
            message: 'Deal redeemed successfully',
            user: { name: user.profile?.name, email: user.email },
            deal: campaign,
            savings: claimedDeal.savings,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Toggle favorite deal
// @route   POST /api/deals/:id/favorite
// @access  Private
export const toggleFavorite = async (req: Request, res: Response) => {
    try {
        const dealId = req.params.id;
        const userId = (req as any).user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.favoritedDeals = user.favoritedDeals || [];

        const index = user.favoritedDeals.findIndex((id: any) => id.toString() === dealId);
        if (index > -1) {
            // Remove from favorites
            user.favoritedDeals.splice(index, 1);
        } else {
            // Add to favorites
            user.favoritedDeals.push(dealId as any);
        }

        await user.save();

        res.status(200).json({
            isFavorited: index === -1,
            message: index === -1 ? 'Added to favorites' : 'Removed from favorites',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user's favorite deals
// @route   GET /api/deals/favorites
// @access  Private
export const getFavorites = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;

        const user = await User.findById(userId).populate({
            path: 'favoritedDeals',
            populate: { path: 'merchantId', select: 'name logo' },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user.favoritedDeals || []);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
