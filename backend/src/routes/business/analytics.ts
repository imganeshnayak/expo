import express from 'express';
import {
    getBusinessOverview,
    getCustomerInsights,
    getRevenueAnalytics,
    getCampaignAnalytics,
    refreshAnalytics,
} from '../../controllers/business/analyticsController';
import { protect } from '../../middleware/auth';

const router = express.Router();

router.get('/overview', protect, getBusinessOverview);
router.get('/customers', protect, getCustomerInsights);
router.get('/revenue', protect, getRevenueAnalytics);
router.get('/campaigns', protect, getCampaignAnalytics);
router.post('/refresh', protect, refreshAnalytics);

export default router;
