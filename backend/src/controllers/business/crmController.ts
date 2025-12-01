import { Request, Response } from 'express';
import Customer from '../../models/business/Customer';
import User from '../../models/User';
import Transaction from '../../models/business/Transaction';
import StampCard from '../../models/business/StampCard';

// @desc    Get all customers for merchant
// @route   GET /api/crm/customers
// @access  Private
export const getCustomers = async (req: Request, res: Response) => {
    try {
        const merchantId = req.user?.merchantId;
        const { segment, search, limit = 50, page = 1 } = req.query;

        const query: any = { merchantId };

        // Filter by segment
        if (segment && segment !== 'all') {
            query.segment = segment;
        }

        // Search by name or phone
        if (search) {
            const searchString = String(search);
            const users = await User.find({
                $or: [
                    { 'profile.name': { $regex: searchString, $options: 'i' } },
                    { phone: { $regex: searchString, $options: 'i' } },
                ],
            }).select('_id');

            query.userId = { $in: users.map(u => u._id) };
        }

        const customers = await Customer.find(query)
            .populate('userId', 'email phone profile')
            .sort({ lastVisit: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));

        const total = await Customer.countDocuments(query);

        res.json({
            success: true,
            customers,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get customer details
// @route   GET /api/crm/customers/:id
// @access  Private
export const getCustomerDetails = async (req: Request, res: Response) => {
    try {
        const merchantId = req.user?.merchantId;
        const customer = await Customer.findOne({
            _id: req.params.id,
            merchantId,
        }).populate('userId', 'email phone profile memberSince');

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Get transactions
        const transactions = await Transaction.find({
            userId: customer.userId,
            merchantId,
        })
            .sort({ createdAt: -1 })
            .limit(10);

        // Get stamp cards
        const stampCards = await StampCard.find({
            userId: customer.userId,
            merchantId,
        });

        res.json({
            success: true,
            customer,
            transactions,
            stampCards,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update customer
// @route   PUT /api/crm/customers/:id
// @access  Private
export const updateCustomer = async (req: Request, res: Response) => {
    try {
        const merchantId = req.user?.merchantId;
        const customer = await Customer.findOne({
            _id: req.params.id,
            merchantId,
        });

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Update allowed fields
        if (req.body.tags) customer.tags = req.body.tags;
        if (req.body.notes) customer.notes = req.body.notes;
        if (req.body.segment) customer.segment = req.body.segment;

        await customer.save();

        res.json({
            success: true,
            customer,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get customer statistics
// @route   GET /api/crm/customers/stats
// @access  Private
export const getCustomerStats = async (req: Request, res: Response) => {
    try {
        const merchantId = req.user?.merchantId;

        const totalCustomers = await Customer.countDocuments({ merchantId });
        const vipCustomers = await Customer.countDocuments({ merchantId, segment: 'vip' });
        const newCustomers = await Customer.countDocuments({ merchantId, segment: 'new' });
        const atRiskCustomers = await Customer.countDocuments({ merchantId, segment: 'at_risk' });

        // Calculate average LTV
        const customers = await Customer.find({ merchantId });
        const totalLTV = customers.reduce((sum, c) => sum + c.lifetimeValue, 0);
        const avgLTV = totalCustomers > 0 ? totalLTV / totalCustomers : 0;

        res.json({
            success: true,
            stats: {
                totalCustomers,
                vipCustomers,
                newCustomers,
                atRiskCustomers,
                avgLTV,
            },
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get at-risk customers
// @route   GET /api/crm/customers/at-risk
// @access  Private
export const getAtRiskCustomers = async (req: Request, res: Response) => {
    try {
        const merchantId = req.user?.merchantId;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const customers = await Customer.find({
            merchantId,
            lastVisit: { $lt: thirtyDaysAgo },
            visitCount: { $gte: 3 }, // Had at least 3 visits before
        })
            .populate('userId', 'email phone profile')
            .sort({ lastVisit: 1 })
            .limit(50);

        res.json({
            success: true,
            customers,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get top customers by LTV
// @route   GET /api/crm/customers/top
// @access  Private
export const getTopCustomers = async (req: Request, res: Response) => {
    try {
        const merchantId = req.user?.merchantId;
        const { limit = 10 } = req.query;

        const customers = await Customer.find({ merchantId })
            .populate('userId', 'email phone profile')
            .sort({ lifetimeValue: -1 })
            .limit(Number(limit));

        res.json({
            success: true,
            customers,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add note to customer
// @route   POST /api/crm/customers/:id/notes
// @access  Private
export const addCustomerNote = async (req: Request, res: Response) => {
    try {
        const merchantId = req.user?.merchantId;
        const { note } = req.body;

        const customer = await Customer.findOne({
            _id: req.params.id,
            merchantId,
        });

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        customer.notes = note;
        await customer.save();

        res.json({
            success: true,
            customer,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
