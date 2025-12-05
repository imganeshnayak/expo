import express from 'express';
import { uploadImage } from '../controllers/uploadController';
import { upload } from '../middleware/uploadMiddleware';
import { protect } from '../middleware/auth';

const router = express.Router();

// POST /api/upload
router.post('/', protect, upload.single('image'), uploadImage);

export default router;
