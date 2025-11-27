"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onSearchRetail = exports.searchRetail = void 0;
const ondcService_1 = __importDefault(require("../services/ondcService"));
// @desc    Trigger ONDC Search (Client calls this)
// @route   POST /api/ondc/retail/search
// @access  Private
const searchRetail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { query, location } = req.body;
        // Construct intent for Retail (Magicpin)
        const intent = {
            item: {
                descriptor: {
                    name: query // e.g., "Pizza"
                }
            },
            fulfillment: {
                type: "Delivery",
                end: {
                    location: {
                        gps: location // "12.9716,77.5946"
                    }
                }
            }
        };
        const response = yield ondcService_1.default.search('ONDC:RET11', intent); // RET11 is F&B
        res.status(200).json(response);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'ONDC Search failed' });
    }
});
exports.searchRetail = searchRetail;
// @desc    Handle on_search callback (Magicpin calls this)
// @route   POST /api/ondc/retail/on_search
// @access  Public (Protected by signature verification in real world)
const onSearchRetail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { context, message } = req.body;
        console.log(`[ONDC] Received on_search from ${context.bpp_id}`);
        // In a real app, we would:
        // 1. Verify signature
        // 2. Parse catalog (message.catalog)
        // 3. Push data to frontend via Socket.IO or save to DB
        // For demo, we'll just log the catalog items
        if (message.catalog) {
            const providers = message.catalog['bpp/providers'];
            if (providers) {
                providers.forEach((p) => {
                    console.log(`Found Provider: ${p.descriptor.name}`);
                    p.items.forEach((i) => {
                        console.log(` - Item: ${i.descriptor.name} | Price: ${i.price.value}`);
                    });
                });
            }
        }
        // Acknowledge receipt
        res.status(200).json({ message: { ack: { status: 'ACK' } } });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error processing on_search' });
    }
});
exports.onSearchRetail = onSearchRetail;
