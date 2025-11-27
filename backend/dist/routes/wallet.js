"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const walletController_1 = require("../controllers/walletController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/test', (req, res) => res.send('Wallet route working'));
router.get('/', auth_1.protect, walletController_1.getWallet);
router.post('/topup', auth_1.protect, walletController_1.topUpWallet);
router.post('/withdraw', auth_1.protect, walletController_1.withdrawWallet);
exports.default = router;
