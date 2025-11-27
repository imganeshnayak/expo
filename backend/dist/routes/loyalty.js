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
exports.default = router;
