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
exports.createDeal = exports.getDealById = exports.getDeals = void 0;
const Deal_1 = __importDefault(require("../models/Deal"));
const Merchant_1 = __importDefault(require("../models/Merchant"));
// @desc    Get all deals
// @route   GET /api/deals
// @access  Public
const getDeals = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deals = yield Deal_1.default.find({ isActive: true, validUntil: { $gte: new Date() } })
            .populate('merchantId', 'name logo')
            .sort({ createdAt: -1 });
        res.status(200).json(deals);
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
    try {
        const deal = yield Deal_1.default.findById(req.params.id).populate('merchantId');
        if (!deal) {
            return res.status(404).json({ message: 'Deal not found' });
        }
        res.status(200).json(deal);
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
        const deal = yield Deal_1.default.create(Object.assign(Object.assign({}, req.body), { merchantId: merchant._id }));
        res.status(201).json(deal);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.createDeal = createDeal;
