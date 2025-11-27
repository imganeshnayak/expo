import express from 'express';
import { getLoyaltyProfile, getMissions, claimReward, createMission } from '../controllers/loyaltyController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/', protect, getLoyaltyProfile);
router.get('/missions', protect, getMissions);
router.post('/missions', protect, createMission); // Admin only in real app
router.post('/claim/:missionId', protect, claimReward);

export default router;
