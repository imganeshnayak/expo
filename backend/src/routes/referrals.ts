import express from 'express';
import { getMyReferral, applyReferralCode } from '../controllers/referralController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/me', protect, getMyReferral);
router.post('/apply', protect, applyReferralCode);

export default router;
