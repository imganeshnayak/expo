"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dealController_1 = require("../controllers/dealController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', dealController_1.getDeals);
router.get('/favorites', auth_1.protect, dealController_1.getFavorites);
router.get('/:id', dealController_1.getDealById);
router.post('/', auth_1.protect, dealController_1.createDeal); // Protected for now
router.post('/:id/claim', auth_1.protect, dealController_1.claimDeal);
router.post('/redeem', auth_1.protect, dealController_1.redeemDeal);
router.post('/:id/favorite', auth_1.protect, dealController_1.toggleFavorite);
exports.default = router;
