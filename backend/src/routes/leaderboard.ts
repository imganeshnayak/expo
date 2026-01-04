import express from 'express';
import { getLeaderboard } from '../controllers/leaderboardController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/', protect, getLeaderboard);

export default router;
