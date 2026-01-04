"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const loyaltyController_1 = require("../controllers/loyaltyController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', auth_1.protect, loyaltyController_1.getLoyaltyProfile);
router.get('/missions', auth_1.protect, loyaltyController_1.getMissions);
router.post('/missions', auth_1.protect, loyaltyController_1.createMission); // Admin only in real app
router.post('/claim/:missionId', auth_1.protect, loyaltyController_1.claimReward);
router.get('/gamification', auth_1.protect, loyaltyController_1.getGamificationProfile);
router.get('/gamification/rewards/pending', auth_1.protect, loyaltyController_1.getPendingRewards);
router.post('/gamification/rewards/:rewardId/claim', auth_1.protect, loyaltyController_1.claimXPReward);
router.post('/action', auth_1.protect, loyaltyController_1.triggerAction);
router.post('/checkin', auth_1.protect, loyaltyController_1.dailyCheckIn);
router.get('/checkin/status', auth_1.protect, loyaltyController_1.getCheckInStatus);
exports.default = router;
