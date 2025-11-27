import express from 'express';
import { getWallet, topUpWallet, withdrawWallet } from '../controllers/walletController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/test', (req, res) => res.send('Wallet route working'));
router.get('/', protect, getWallet);
router.post('/topup', protect, topUpWallet);
router.post('/withdraw', protect, withdrawWallet);

export default router;
