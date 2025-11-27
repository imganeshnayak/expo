"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ondcRetailController_1 = require("../controllers/ondcRetailController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Client-facing API (Protected)
router.post('/search', auth_1.protect, ondcRetailController_1.searchRetail);
// ONDC Callback API (Public - Magicpin calls this)
router.post('/on_search', ondcRetailController_1.onSearchRetail);
exports.default = router;
