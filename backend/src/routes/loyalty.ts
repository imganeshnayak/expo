import express from 'express';
import {
    getLoyaltyProfile,
    getMissions,
    claimReward,
    createMission,
    getGamificationProfile,
    triggerAction,
    getPendingRewards,
    claimXPReward,
    dailyCheckIn,
    getCheckInStatus
} from '../controllers/loyaltyController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/', protect, getLoyaltyProfile);
router.get('/missions', protect, getMissions);
router.post('/missions', protect, createMission); // Admin only in real app
router.post('/claim/:missionId', protect, claimReward);
router.get('/gamification', protect, getGamificationProfile);
router.get('/gamification/rewards/pending', protect, getPendingRewards);
router.post('/gamification/rewards/:rewardId/claim', protect, claimXPReward);
router.post('/action', protect, triggerAction);
router.post('/checkin', protect, dailyCheckIn);
router.get('/checkin/status', protect, getCheckInStatus);

export default router;

