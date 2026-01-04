import express from 'express';
import {
    sendPushNotification,
    getPushNotificationHistory,
    getPushNotificationStats,
    clearPushNotificationHistory,
} from '../../controllers/business/pushNotificationController';
import { protect } from '../../middleware/auth';

const router = express.Router();

// All routes require authentication
router.post('/', protect, sendPushNotification);
router.get('/', protect, getPushNotificationHistory);
router.get('/stats', protect, getPushNotificationStats);
router.delete('/', protect, clearPushNotificationHistory);

export default router;
