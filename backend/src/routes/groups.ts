import express from 'express';
import { createGroup, getMyGroups, getGroupDetails, sendMessage } from '../controllers/groupController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/', protect, createGroup);
router.get('/', protect, getMyGroups);
router.get('/:id', protect, getGroupDetails);
router.post('/:id/messages', protect, sendMessage);

export default router;
