import express from 'express';
import { getDeals, getDealById, createDeal } from '../controllers/dealController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/', getDeals);
router.get('/:id', getDealById);
router.post('/', protect, createDeal); // Protected for now

export default router;
