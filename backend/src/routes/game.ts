import express from 'express';
import { protect } from '../middleware/auth';
import { getSpawns, catchUtopian, getMyCollection } from '../controllers/gameController';

const router = express.Router();

router.get('/spawns', protect, getSpawns);
router.post('/catch', protect, catchUtopian);
router.get('/collection', protect, getMyCollection);

export default router;
