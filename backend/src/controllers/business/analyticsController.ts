import { Request, Response } from 'express';
import Analytics from '../../models/business/Analytics';
import Customer from '../../models/business/Customer';
import Transaction from '../../models/business/Transaction';
import Campaign from '../../models/business/Campaign';

// @desc    Get business overview
// @route   GET /api/analytics/overview
// @access  Private
export const getBusinessOverview = async (req: Request, res: Response) => {
    try {
        const merchantId = req.user?.merchantId;
        const { period = 'week' } = req.query;

        // Get latest analytics
        const analytics = await Analytics.findOne({
            merchantId,
            period,
        }).sort({ periodStart: -1 });

        if (!analytics) {
            // Generate fresh analytics if none exist
            const freshAnalytics = await generateAnalytics(merchantId, period as string);
            return res.json({
                success: true,
                analytics: freshAnalytics,
            });
        }

        res.json({
            success: true,
            analytics,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get customer insights
// @route   GET /api/analytics/customers
// @access  Private
export const getCustomerInsights = async (req: Request, res: Response) => {
    try {
        const merchantId = req.user?.merchantId;

        const totalCustomers = await Customer.countDocuments({ merchantId });
        const vipCustomers = await Customer.countDocuments({ merchantId, segment: 'vip' });
        const regularCustomers = await Customer.countDocuments({ merchantId, segment: 'regular' });
        const newCustomers = await Customer.countDocuments({ merchantId, segment: 'new' });
        const atRiskCustomers = await Customer.countDocuments({ merchantId, segment: 'at_risk' });

        // Get average metrics
        const customers = await Customer.find({ merchantId });
        const avgLTV = customers.reduce((sum, c) => sum + c.lifetimeValue, 0) / (totalCustomers || 1);
        const avgVisits = customers.reduce((sum, c) => sum + c.visitCount, 0) / (totalCustomers || 1);
        const avgSpend = customers.reduce((sum, c) => sum + c.averageSpend, 0) / (totalCustomers || 1);

        res.json({
            success: true,
            insights: {
                totalCustomers,
                segments: {
                    vip: vipCustomers,
                    regular: regularCustomers,
                    new: newCustomers,
                    atRisk: atRiskCustomers,
                },
                averages: {
                    lifetimeValue: avgLTV,
                    visits: avgVisits,
                    spend: avgSpend,
                },
            },
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get revenue analytics
// @route   GET /api/analytics/revenue
// @access  Private
export const getRevenueAnalytics = async (req: Request, res: Response) => {
    try {
        const merchantId = req.user?.merchantId;
        const { days = 30 } = req.query;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - Number(days));

        const transactions = await Transaction.find({
            merchantId,
            createdAt: { $gte: startDate },
            status: 'completed',
        });

        const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
        const avgOrderValue = totalRevenue / (transactions.length || 1);

        // Group by day
        const revenueByDay: Record<string, number> = {};
        transactions.forEach(t => {
            const day = t.createdAt.toISOString().split('T')[0];
            revenueByDay[day] = (revenueByDay[day] || 0) + t.amount;
        });

        res.json({
            success: true,
            revenue: {
                total: totalRevenue,
                avgOrderValue,
                transactionCount: transactions.length,
                byDay: revenueByDay,
            },
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get campaign performance
// @route   GET /api/analytics/campaigns
// @access  Private
export const getCampaignAnalytics = async (req: Request, res: Response) => {
    try {
        const merchantId = req.user?.merchantId;

        const campaigns = await Campaign.find({ merchantId });

        const totalSpent = campaigns.reduce((sum, c) => sum + c.budget.spent, 0);
        const totalRevenue = campaigns.reduce((sum, c) => sum + c.performance.revenue, 0);
        const totalConversions = campaigns.reduce((sum, c) => sum + c.performance.conversions, 0);
        const totalClaims = campaigns.reduce((sum, c) => sum + (c.performance.claims || 0), 0);

        const avgROI = totalSpent > 0 ? ((totalRevenue - totalSpent) / totalSpent) * 100 : 0;

        const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

        res.json({
            success: true,
            campaigns: {
                total: campaigns.length,
                active: activeCampaigns,
                totalSpent,
                totalRevenue,
                totalConversions,
                totalClaims,
                avgROI,
                topCampaigns: campaigns
                    .sort((a, b) => b.performance.revenue - a.performance.revenue)
                    .slice(0, 5)
                    .map(c => ({
                        id: c._id,
                        name: c.name,
                        revenue: c.performance.revenue,
                        conversions: c.performance.conversions,
                        claims: c.performance.claims || 0,
                        roi: c.performance.roi,
                    })),
            },
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Refresh analytics
// @route   POST /api/analytics/refresh
// @access  Private
export const refreshAnalytics = async (req: Request, res: Response) => {
    try {
        const merchantId = req.user?.merchantId;
        const { period = 'week' } = req.body;

        const analytics = await generateAnalytics(merchantId, period);

        res.json({
            success: true,
            analytics,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Helper function to generate analytics
async function generateAnalytics(merchantId: any, period: string) {
    const now = new Date();
    let periodStart = new Date();
    let periodEnd = new Date();

    if (period === 'day') {
        periodStart.setHours(0, 0, 0, 0);
        periodEnd.setHours(23, 59, 59, 999);
    } else if (period === 'week') {
        periodStart.setDate(now.getDate() - 7);
    } else if (period === 'month') {
        periodStart.setDate(now.getDate() - 30);
    }

    // Get customers
    const customers = await Customer.find({ merchantId });
    const newCustomers = await Customer.countDocuments({
        merchantId,
        createdAt: { $gte: periodStart },
    });

    // Get transactions
    const transactions = await Transaction.find({
        merchantId,
        createdAt: { $gte: periodStart, $lte: periodEnd },
        status: 'completed',
    });

    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
    const avgOrderValue = totalRevenue / (transactions.length || 1);

    // Get campaigns
    const campaigns = await Campaign.find({ merchantId, status: 'active' });
    const campaignRevenue = campaigns.reduce((sum, c) => sum + c.performance.revenue, 0);
    const campaignSpent = campaigns.reduce((sum, c) => sum + c.budget.spent, 0);
    const campaignROI = campaignSpent > 0 ? ((campaignRevenue - campaignSpent) / campaignSpent) * 100 : 0;

    // Create or update analytics
    const analytics = await Analytics.findOneAndUpdate(
        { merchantId, period, periodStart },
        {
            merchantId,
            period,
            periodStart,
            periodEnd,
            metrics: {
                totalCustomers: customers.length,
                newCustomers,
                returningCustomers: customers.length - newCustomers,
                totalRevenue,
                averageOrderValue: avgOrderValue,
                customerAcquisitionCost: 0,
                customerLifetimeValue: customers.reduce((sum, c) => sum + c.lifetimeValue, 0) / (customers.length || 1),
                churnRate: 0,
                activeCampaigns: campaigns.length,
                campaignRevenue,
                campaignROI,
                topItems: [],
                peakHours: [],
                peakDays: [],
            },
        },
        { upsert: true, new: true }
    );

    return analytics;
}
