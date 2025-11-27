"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const rideController_1 = require("../controllers/rideController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/search', auth_1.protect, rideController_1.searchRides);
router.post('/book', auth_1.protect, rideController_1.bookRide);
router.get('/active', auth_1.protect, rideController_1.getActiveRide);
exports.default = router;
