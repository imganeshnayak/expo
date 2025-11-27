import express from 'express';
import { searchRetail, onSearchRetail } from '../controllers/ondcRetailController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Client-facing API (Protected)
router.post('/search', protect, searchRetail);

// ONDC Callback API (Public - Magicpin calls this)
router.post('/on_search', onSearchRetail);

export default router;
