import { Request, Response } from 'express';
import Campaign from '../../models/business/Campaign';
import CampaignEvent from '../../models/business/CampaignEvent';

// @desc    Get all campaigns
// @route   GET /api/campaigns
// @access  Private
export const getCampaigns = async (req: Request, res: Response) => {
    try {
        const merchantId = req.user?.merchantId;
        const { status, type } = req.query;

        const query: any = { merchantId };
        if (status && status !== 'all') query.status = status;
        if (type) query.type = type;

        const campaigns = await Campaign.find(query)
            .sort({ createdAt: -1 })
            .populate('merchantId', 'name logo');

        const mappedCampaigns = campaigns.map((c: any) => ({
            ...c.toObject(),
            // Map Backend fields to Frontend Deal interface
            category: c.consumerCategory || c.category, // Use consumer category if available
            originalPrice: c.pricing?.originalPrice || 0,
            discountedPrice: c.pricing?.discountedPrice || 0,
            validFrom: c.targeting?.schedule?.startDate,
            validUntil: c.targeting?.schedule?.endDate,
            discountPercentage: c.offer?.discountPercent,
            currentRedemptions: c.performance?.conversions || 0,
            isActive: c.status === 'active',
        }));

        res.json({
            success: true,
            campaigns: mappedCampaigns,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get campaign by ID
// @route   GET /api/campaigns/:id
// @access  Private
export const getCampaignById = async (req: Request, res: Response) => {
    try {
        const merchantId = req.user?.merchantId;
        const campaign = await Campaign.findOne({
            _id: req.params.id,
            merchantId,
        }).populate('merchantId', 'name logo');

        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        const c: any = campaign;
        const mappedCampaign = {
            ...c.toObject(),
            // Map Backend fields to Frontend Deal interface
            category: c.consumerCategory || c.category,
            originalPrice: c.pricing?.originalPrice || 0,
            discountedPrice: c.pricing?.discountedPrice || 0,
            validFrom: c.targeting?.schedule?.startDate,
            validUntil: c.targeting?.schedule?.endDate,
            discountPercentage: c.offer?.discountPercent,
            currentRedemptions: c.performance?.conversions || 0,
            isActive: c.status === 'active',
        };

        res.json({
            success: true,
            campaign: mappedCampaign,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create campaign
// @route   POST /api/campaigns
// @access  Private
export const createCampaign = async (req: Request, res: Response) => {
    try {
        const merchantId = req.user?.merchantId;

        const campaign = await Campaign.create({
            merchantId,
            ...req.body,
        });

        res.status(201).json({
            success: true,
            campaign,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update campaign
// @route   PUT /api/campaigns/:id
// @access  Private
export const updateCampaign = async (req: Request, res: Response) => {
    try {
        const merchantId = req.user?.merchantId;
        const campaign = await Campaign.findOne({
            _id: req.params.id,
            merchantId,
        });

        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        Object.assign(campaign, req.body);
        await campaign.save();

        res.json({
            success: true,
            campaign,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete campaign
// @route   DELETE /api/campaigns/:id
// @access  Private
export const deleteCampaign = async (req: Request, res: Response) => {
    try {
        const merchantId = req.user?.merchantId;
        const campaign = await Campaign.findOneAndDelete({
            _id: req.params.id,
            merchantId,
        });

        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        res.json({
            success: true,
            message: 'Campaign deleted',
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Pause campaign
// @route   POST /api/campaigns/:id/pause
// @access  Private
export const pauseCampaign = async (req: Request, res: Response) => {
    try {
        const merchantId = req.user?.merchantId;
        const campaign = await Campaign.findOne({
            _id: req.params.id,
            merchantId,
        });

        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        campaign.status = 'paused';
        await campaign.save();

        res.json({
            success: true,
            campaign,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Resume campaign
// @route   POST /api/campaigns/:id/resume
// @access  Private
export const resumeCampaign = async (req: Request, res: Response) => {
    try {
        const merchantId = req.user?.merchantId;
        const campaign = await Campaign.findOne({
            _id: req.params.id,
            merchantId,
        });

        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        campaign.status = 'active';
        await campaign.save();

        res.json({
            success: true,
            campaign,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Archive campaign
// @route   POST /api/campaigns/:id/archive
// @access  Private
// @ts-ignore
export const archiveCampaign = async (req: Request, res: Response) => {
    try {
        const merchantId = req.user?.merchantId;
        const campaign = await Campaign.findOne({
            _id: req.params.id,
            merchantId,
        });

        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        campaign.status = 'archived';
        await campaign.save();

        res.json({
            success: true,
            campaign,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Duplicate campaign
// @route   POST /api/campaigns/:id/duplicate
// @access  Private
export const duplicateCampaign = async (req: Request, res: Response) => {
    try {
        const merchantId = req.user?.merchantId;
        const campaign = await Campaign.findOne({
            _id: req.params.id,
            merchantId,
        });

        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        const newCampaign = await Campaign.create({
            merchantId,
            name: `${campaign.name} (Copy)`,
            type: campaign.type,
            status: 'draft',
            budget: { ...campaign.budget, spent: 0 },
            targeting: campaign.targeting,
            offer: campaign.offer,
            performance: {
                impressions: 0,
                conversions: 0,
                revenue: 0,
                roi: 0,
                costPerAcquisition: 0,
                clickThroughRate: 0,
            },
        });

        res.status(201).json({
            success: true,
            campaign: newCampaign,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Track campaign event
// @route   POST /api/campaigns/:id/track
// @access  Private
export const trackCampaignEvent = async (req: Request, res: Response) => {
    try {
        const { eventType, userId, revenue } = req.body;
        const campaignId = req.params.id;

        // Create event
        await CampaignEvent.create({
            campaignId,
            userId,
            eventType,
            revenue,
        });

        // Update campaign performance
        const campaign = await Campaign.findById(campaignId);
        if (campaign) {
            if (eventType === 'impression') {
                campaign.performance.impressions += 1;
            } else if (eventType === 'click') {
                campaign.performance.impressions += 1;
            } else if (eventType === 'conversion') {
                campaign.performance.conversions += 1;
                campaign.performance.revenue += revenue || 0;
            }

            // Calculate ROI
            if (campaign.budget.spent > 0) {
                campaign.performance.roi =
                    ((campaign.performance.revenue - campaign.budget.spent) / campaign.budget.spent) * 100;
            }

            // Calculate CTR
            if (campaign.performance.impressions > 0) {
                campaign.performance.clickThroughRate =
                    (campaign.performance.conversions / campaign.performance.impressions) * 100;
            }

            await campaign.save();
        }

        res.json({
            success: true,
            message: 'Event tracked',
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get campaign performance
// @route   GET /api/campaigns/:id/performance
// @access  Private
export const getCampaignPerformance = async (req: Request, res: Response) => {
    try {
        const merchantId = req.user?.merchantId;
        const campaign = await Campaign.findOne({
            _id: req.params.id,
            merchantId,
        });

        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        // Get events
        const events = await CampaignEvent.find({ campaignId: campaign._id })
            .sort({ createdAt: -1 })
            .limit(100);

        res.json({
            success: true,
            performance: campaign.performance,
            events,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
