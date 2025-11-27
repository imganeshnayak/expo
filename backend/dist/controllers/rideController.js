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
exports.getActiveRide = exports.bookRide = exports.searchRides = void 0;
const Ride_1 = __importDefault(require("../models/Ride"));
const ondcService_1 = __importDefault(require("../services/ondcService"));
const uuid_1 = require("uuid");
// @desc    Search for rides (ONDC)
// @route   POST /api/rides/search
// @access  Private
const searchRides = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pickup, destination } = req.body;
        // Construct intent for Mobility (TRV10)
        const intent = {
            fulfillment: {
                start: {
                    location: {
                        gps: pickup // "12.9716,77.5946"
                    }
                },
                end: {
                    location: {
                        gps: destination // "12.9279,77.6271"
                    }
                }
            }
        };
        // Call ONDC Service
        const response = yield ondcService_1.default.search('ONDC:TRV10', intent);
        res.status(200).json(response);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ride search failed' });
    }
});
exports.searchRides = searchRides;
// @desc    Book a ride (Mock implementation for now)
// @route   POST /api/rides/book
// @access  Private
const bookRide = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { providerId, pickup, destination, price } = req.body;
        const ride = yield Ride_1.default.create({
            userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
            provider: {
                id: providerId || 'namma-yatri',
                name: 'Namma Yatri',
                type: 'auto'
            },
            pickup: {
                address: 'Pickup Location',
                coordinates: { latitude: 0, longitude: 0 } // Mock
            },
            destination: {
                address: 'Drop Location',
                coordinates: { latitude: 0, longitude: 0 } // Mock
            },
            pricing: {
                basePrice: price || 100,
                finalPrice: price || 100,
                currency: 'INR'
            },
            status: 'confirmed',
            otp: '1234',
            ondcData: {
                transactionId: (0, uuid_1.v4)(),
                messageId: (0, uuid_1.v4)(),
                bppId: 'namma-yatri-bpp',
                bppUri: 'https://mock-bpp.com'
            }
        });
        res.status(201).json(ride);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Booking failed' });
    }
});
exports.bookRide = bookRide;
// @desc    Get active ride
// @route   GET /api/rides/active
// @access  Private
const getActiveRide = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const ride = yield Ride_1.default.findOne({
            userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
            status: { $in: ['searching', 'confirmed', 'arriving', 'ongoing'] }
        }).sort({ createdAt: -1 });
        if (!ride) {
            return res.status(404).json({ message: 'No active ride' });
        }
        res.status(200).json(ride);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getActiveRide = getActiveRide;
