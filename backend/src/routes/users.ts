import express from 'express';
import { getClaimedDeals, updatePushToken, getUserNotifications } from '../controllers/userController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/claimed-deals', protect, getClaimedDeals);
router.put('/push-token', protect, updatePushToken);
router.get('/notifications', protect, getUserNotifications);

export default router;
