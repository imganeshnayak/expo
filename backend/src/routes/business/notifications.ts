import express from 'express';
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
} from '../../controllers/business/notificationController';
import { protect } from '../../middleware/auth';

const router = express.Router();

router.get('/', protect, getNotifications);
router.post('/:id/read', protect, markAsRead);
router.post('/read-all', protect, markAllAsRead);
router.delete('/:id', protect, deleteNotification);
router.delete('/', protect, clearAllNotifications);

export default router;
