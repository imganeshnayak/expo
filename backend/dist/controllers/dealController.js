"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFavorites = exports.toggleFavorite = exports.redeemDeal = exports.claimDeal = exports.createDeal = exports.getDealById = exports.getDeals = void 0;
const Campaign_1 = __importDefault(require("../models/business/Campaign"));
const Merchant_1 = __importDefault(require("../models/Merchant"));
const User_1 = __importDefault(require("../models/User"));
// @desc    Get all deals (active campaigns)
// @route   GET /api/deals
// @access  Public
const getDeals = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch active campaigns that are discount or combo types
        const campaigns = yield Campaign_1.default.find({
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
        const mappedDeals = campaigns.map((c) => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            return ({
                _id: c._id,
                merchantId: c.merchantId,
                title: c.title || c.name,
                description: c.description || '',
                category: c.consumerCategory || c.category,
                originalPrice: ((_a = c.pricing) === null || _a === void 0 ? void 0 : _a.originalPrice) || 0,
                discountedPrice: ((_b = c.pricing) === null || _b === void 0 ? void 0 : _b.discountedPrice) || 0,
                discountPercentage: ((_c = c.offer) === null || _c === void 0 ? void 0 : _c.discountPercent) || 0,
                validFrom: ((_e = (_d = c.targeting) === null || _d === void 0 ? void 0 : _d.schedule) === null || _e === void 0 ? void 0 : _e.startDate) || c.createdAt,
                validUntil: ((_g = (_f = c.targeting) === null || _f === void 0 ? void 0 : _f.schedule) === null || _g === void 0 ? void 0 : _g.endDate) || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
                termsAndConditions: c.termsAndConditions || [],
                maxRedemptions: c.maxRedemptions,
                currentRedemptions: ((_h = c.performance) === null || _h === void 0 ? void 0 : _h.conversions) || 0,
                isActive: c.status === 'active',
                images: c.images || [],
                createdAt: c.createdAt,
            });
        });
        res.status(200).json(mappedDeals);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getDeals = getDeals;
// @desc    Get deal by ID
// @route   GET /api/deals/:id
// @access  Public
const getDealById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    try {
        const campaign = yield Campaign_1.default.findById(req.params.id).populate('merchantId');
        if (!campaign) {
            return res.status(404).json({ message: 'Deal not found' });
        }
        const c = campaign;
        const mappedDeal = {
            _id: c._id,
            merchantId: c.merchantId,
            title: c.title || c.name,
            description: c.description || '',
            category: c.consumerCategory || c.category,
            originalPrice: ((_a = c.pricing) === null || _a === void 0 ? void 0 : _a.originalPrice) || 0,
            discountedPrice: ((_b = c.pricing) === null || _b === void 0 ? void 0 : _b.discountedPrice) || 0,
            discountPercentage: ((_c = c.offer) === null || _c === void 0 ? void 0 : _c.discountPercent) || 0,
            validFrom: ((_e = (_d = c.targeting) === null || _d === void 0 ? void 0 : _d.schedule) === null || _e === void 0 ? void 0 : _e.startDate) || c.createdAt,
            validUntil: ((_g = (_f = c.targeting) === null || _f === void 0 ? void 0 : _f.schedule) === null || _g === void 0 ? void 0 : _g.endDate) || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            termsAndConditions: c.termsAndConditions || [],
            maxRedemptions: c.maxRedemptions,
            currentRedemptions: ((_h = c.performance) === null || _h === void 0 ? void 0 : _h.conversions) || 0,
            isActive: c.status === 'active',
            images: c.images || [],
            createdAt: c.createdAt,
        };
        res.status(200).json(mappedDeal);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getDealById = getDealById;
// @desc    Create a deal (for testing/merchants)
// @route   POST /api/deals
// @access  Private (should be Merchant/Admin only)
const createDeal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // For simplicity, we'll create a dummy merchant if one doesn't exist
        let merchant = yield Merchant_1.default.findOne();
        if (!merchant) {
            merchant = yield Merchant_1.default.create({
                name: 'Demo Merchant',
                description: 'Best deals in town',
                category: ['Food', 'Retail'],
                contact: { email: 'demo@merchant.com', phone: '9876543210' },
                location: { address: 'Bangalore', coordinates: { latitude: 12.9716, longitude: 77.5946 } }
            });
        }
        // Create a Campaign instead of Deal
        const campaign = yield Campaign_1.default.create({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.createDeal = createDeal;
// @desc    Claim a deal
// @route   POST /api/deals/:id/claim
// @access  Private
const claimDeal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const dealId = req.params.id;
        const userId = req.user._id; // From auth middleware
        // Find the campaign (deal)
        const campaign = yield Campaign_1.default.findById(dealId);
        if (!campaign || campaign.status !== 'active') {
            return res.status(404).json({ message: 'Deal not found or inactive' });
        }
        // Find user
        const user = yield User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check if already claimed
        const alreadyClaimed = (_a = user.claimedDeals) === null || _a === void 0 ? void 0 : _a.some((claim) => claim.dealId.toString() === dealId);
        if (alreadyClaimed) {
            return res.status(400).json({ message: 'Deal already claimed' });
        }
        // Generate unique redemption code (for QR)
        const redemptionCode = `${userId.toString().slice(-6)}-${dealId.toString().slice(-6)}-${Date.now().toString().slice(-6)}`;
        // Add to user's claimed deals
        user.claimedDeals = user.claimedDeals || [];
        user.claimedDeals.push({
            dealId: campaign._id,
            claimedAt: new Date(),
            savings: campaign.pricing.originalPrice - campaign.pricing.discountedPrice,
            redemptionCode,
            status: 'pending',
        });
        yield user.save();
        // Update campaign analytics - claims
        campaign.performance = campaign.performance || { conversions: 0, claims: 0 };
        campaign.performance.claims = (campaign.performance.claims || 0) + 1;
        yield campaign.save();
        res.status(200).json({
            message: 'Deal claimed successfully',
            deal: campaign,
            savings: campaign.pricing.originalPrice - campaign.pricing.discountedPrice,
            redemptionCode,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.claimDeal = claimDeal;
// @desc    Redeem a deal (Merchant verification)
// @route   POST /api/deals/redeem
// @access  Private (Merchant)
const redeemDeal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { redemptionCode } = req.body;
        const merchantId = req.user._id; // Merchant user from auth
        // Find user with this redemption code
        const user = yield User_1.default.findOne({
            'claimedDeals.redemptionCode': redemptionCode,
        }).populate('claimedDeals.dealId');
        if (!user) {
            return res.status(404).json({ message: 'Invalid redemption code' });
        }
        // Find the specific claimed deal
        const claimedDeal = user.claimedDeals.find((claim) => claim.redemptionCode === redemptionCode);
        if (!claimedDeal) {
            return res.status(404).json({ message: 'Deal not found' });
        }
        // Check if already redeemed
        if (claimedDeal.status === 'redeemed') {
            return res.status(400).json({ message: 'Deal already redeemed' });
        }
        // Verify merchant owns this deal
        const campaign = yield Campaign_1.default.findById(claimedDeal.dealId);
        if (campaign.merchantId.toString() !== merchantId.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        // Mark as redeemed
        claimedDeal.status = 'redeemed';
        claimedDeal.redeemedAt = new Date();
        yield user.save();
        // Update campaign analytics - actual redemptions
        campaign.performance.conversions = (campaign.performance.conversions || 0) + 1;
        yield campaign.save();
        res.status(200).json({
            message: 'Deal redeemed successfully',
            user: { name: (_a = user.profile) === null || _a === void 0 ? void 0 : _a.name, email: user.email },
            deal: campaign,
            savings: claimedDeal.savings,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.redeemDeal = redeemDeal;
// @desc    Toggle favorite deal
// @route   POST /api/deals/:id/favorite
// @access  Private
const toggleFavorite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dealId = req.params.id;
        const userId = req.user._id;
        const user = yield User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.favoritedDeals = user.favoritedDeals || [];
        const index = user.favoritedDeals.findIndex((id) => id.toString() === dealId);
        if (index > -1) {
            // Remove from favorites
            user.favoritedDeals.splice(index, 1);
        }
        else {
            // Add to favorites
            user.favoritedDeals.push(dealId);
        }
        yield user.save();
        res.status(200).json({
            isFavorited: index === -1,
            message: index === -1 ? 'Added to favorites' : 'Removed from favorites',
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.toggleFavorite = toggleFavorite;
// @desc    Get user's favorite deals
// @route   GET /api/deals/favorites
// @access  Private
const getFavorites = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const user = yield User_1.default.findById(userId).populate({
            path: 'favoritedDeals',
            populate: { path: 'merchantId', select: 'name logo' },
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user.favoritedDeals || []);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getFavorites = getFavorites;
