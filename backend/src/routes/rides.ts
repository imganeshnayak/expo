import express from 'express';
import { searchRides, bookRide, getActiveRide } from '../controllers/rideController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/search', protect, searchRides);
router.post('/book', protect, bookRide);
router.get('/active', protect, getActiveRide);

export default router;
