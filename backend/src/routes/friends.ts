import express from 'express';
import {
    sendFriendRequest,
    respondToFriendRequest,
    getFriends,
    getFriendRequests,
    syncContacts,
} from '../controllers/friendController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/request', protect, sendFriendRequest);
router.put('/respond', protect, respondToFriendRequest);
router.get('/', protect, getFriends);
router.get('/requests', protect, getFriendRequests);
router.post('/sync-contacts', protect, syncContacts);

export default router;
