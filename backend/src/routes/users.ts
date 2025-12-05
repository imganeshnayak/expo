import express from 'express';
import { getClaimedDeals } from '../controllers/userController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/claimed-deals', protect, getClaimedDeals);

export default router;
