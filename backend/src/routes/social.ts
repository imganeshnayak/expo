import express from 'express';
import { getFeed } from '../controllers/socialController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/feed', protect, getFeed);

export default router;
