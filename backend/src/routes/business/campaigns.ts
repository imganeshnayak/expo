import express from 'express';
import {
    getCampaigns,
    getCampaignById,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    pauseCampaign,
    resumeCampaign,
    duplicateCampaign,
    archiveCampaign,
    trackCampaignEvent,
    getCampaignPerformance,
} from '../../controllers/business/campaignController';
import { protect } from '../../middleware/auth';

const router = express.Router();

router.get('/', protect, getCampaigns);
router.post('/', protect, createCampaign);
router.get('/:id', protect, getCampaignById);
router.put('/:id', protect, updateCampaign);
router.delete('/:id', protect, deleteCampaign);
router.post('/:id/pause', protect, pauseCampaign);
router.post('/:id/resume', protect, resumeCampaign);
router.post('/:id/archive', protect, archiveCampaign);
router.post('/:id/duplicate', protect, duplicateCampaign);
router.post('/:id/track', trackCampaignEvent); // Public for tracking
router.get('/:id/performance', protect, getCampaignPerformance);

export default router;
