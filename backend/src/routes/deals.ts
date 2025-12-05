import express from 'express';
import { getDeals, getDealById, createDeal, claimDeal, redeemDeal, toggleFavorite, getFavorites } from '../controllers/dealController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/', getDeals);
router.get('/favorites', protect, getFavorites);
router.get('/:id', getDealById);
router.post('/', protect, createDeal); // Protected for now
router.post('/:id/claim', protect, claimDeal);
router.post('/redeem', protect, redeemDeal);
router.post('/:id/favorite', protect, toggleFavorite);

export default router;
