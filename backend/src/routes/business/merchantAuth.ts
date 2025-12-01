import express from 'express';
import {
    registerMerchant,
    loginMerchant,
    getMerchantProfile,
    updateMerchantProfile,
    updateMerchantSettings,
} from '../../controllers/business/merchantAuthController';
import { protect } from '../../middleware/auth';

const router = express.Router();

router.post('/register', registerMerchant);
router.post('/login', loginMerchant);
router.get('/profile', protect, getMerchantProfile);
router.put('/profile', protect, updateMerchantProfile);
router.put('/settings', protect, updateMerchantSettings);

export default router;
