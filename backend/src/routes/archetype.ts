import express from 'express';
import { setArchetype, getArchetype } from '../controllers/archetypeController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/', protect, setArchetype);
router.get('/', protect, getArchetype);

export default router;
