import { Request, Response } from 'express';
import Deal from '../models/Deal';
import Merchant from '../models/Merchant';

// @desc    Get all deals
// @route   GET /api/deals
// @access  Public
export const getDeals = async (req: Request, res: Response) => {
    try {
        const deals = await Deal.find({ isActive: true, validUntil: { $gte: new Date() } })
            .populate('merchantId', 'name logo')
            .sort({ createdAt: -1 });

        res.status(200).json(deals);
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
        const deal = await Deal.findById(req.params.id).populate('merchantId');

        if (!deal) {
            return res.status(404).json({ message: 'Deal not found' });
        }

        res.status(200).json(deal);
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

        const deal = await Deal.create({
            ...req.body,
            merchantId: merchant._id,
        });

        res.status(201).json(deal);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
