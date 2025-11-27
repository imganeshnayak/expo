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
exports.createMission = exports.claimReward = exports.getMissions = exports.getLoyaltyProfile = void 0;
const User_1 = __importDefault(require("../models/User"));
const PointTransaction_1 = __importDefault(require("../models/PointTransaction"));
const Mission_1 = __importDefault(require("../models/Mission"));
// @desc    Get loyalty profile (points, level, history)
// @route   GET /api/loyalty
// @access  Private
const getLoyaltyProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const user = yield User_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id).select('loyaltyPoints loyaltyLevel');
        const history = yield PointTransaction_1.default.find({ userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id })
            .sort({ createdAt: -1 })
            .limit(10);
        res.status(200).json({
            points: user === null || user === void 0 ? void 0 : user.loyaltyPoints,
            level: user === null || user === void 0 ? void 0 : user.loyaltyLevel,
            history,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getLoyaltyProfile = getLoyaltyProfile;
// @desc    Get available missions
// @route   GET /api/loyalty/missions
// @access  Private
const getMissions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const missions = yield Mission_1.default.find({ isActive: true });
        res.status(200).json(missions);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getMissions = getMissions;
// @desc    Claim mission reward (Mock logic)
// @route   POST /api/loyalty/claim/:missionId
// @access  Private
const claimReward = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const mission = yield Mission_1.default.findById(req.params.missionId);
        if (!mission) {
            return res.status(404).json({ message: 'Mission not found' });
        }
        // In real app, check if user met requirements (e.g., count rides)
        // For now, we assume they did and just award points
        const user = yield User_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        // Add points
        user.loyaltyPoints += mission.rewardPoints;
        // Update Level Logic (Simple)
        if (user.loyaltyPoints > 1000)
            user.loyaltyLevel = 'Platinum';
        else if (user.loyaltyPoints > 500)
            user.loyaltyLevel = 'Gold';
        else if (user.loyaltyPoints > 200)
            user.loyaltyLevel = 'Silver';
        yield user.save();
        // Record Transaction
        yield PointTransaction_1.default.create({
            userId: user._id,
            type: 'earn',
            amount: mission.rewardPoints,
            description: `Completed mission: ${mission.title}`,
            source: 'mission',
            referenceId: mission._id.toString(),
        });
        res.status(200).json({
            message: 'Reward claimed',
            points: user.loyaltyPoints,
            level: user.loyaltyLevel
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.claimReward = claimReward;
// @desc    Create a mission (For testing/admin)
// @route   POST /api/loyalty/missions
// @access  Private
const createMission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mission = yield Mission_1.default.create(req.body);
        res.status(201).json(mission);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.createMission = createMission;
