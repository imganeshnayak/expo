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
exports.getCheckInStatus = exports.dailyCheckIn = exports.claimXPReward = exports.getPendingRewards = exports.triggerAction = exports.getGamificationProfile = exports.createMission = exports.claimReward = exports.getMissions = exports.getLoyaltyProfile = void 0;
const User_1 = __importDefault(require("../models/User"));
const PointTransaction_1 = __importDefault(require("../models/PointTransaction"));
const Mission_1 = __importDefault(require("../models/Mission"));
const GamificationService_1 = require("../services/GamificationService");
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
// @desc    Get gamification profile (XP, Rank, Unlocks)
// @route   GET /api/loyalty/gamification
// @access  Private
const getGamificationProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = yield User_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id).select('gamification');
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        // Initialize if missing
        if (!user.gamification || !user.gamification.xp) {
            // This should ideally be handled by a migration or the service, but for safety:
            user.gamification = {
                xp: { current: 0, lifetime: 0 },
                rank: { league: 'Bronze', tier: 1, displayName: 'Bronze I' },
                streak: { current: 0, lastActiveDate: new Date() },
                unlockedFeatures: [],
                skillTree: new Map(),
                pendingRewards: [],
            };
            yield user.save();
        }
        res.status(200).json(user.gamification);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getGamificationProfile = getGamificationProfile;
// @desc    Trigger a gamification action (Dev/Test)
// @route   POST /api/loyalty/action
// @access  Private
const triggerAction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const { amount, source } = req.body;
        // Queue XP instead of adding directly
        const result = yield (0, GamificationService_1.queueXP)(req.user._id.toString(), amount, source, `Action: ${source}`);
        res.status(200).json({ message: 'XP Queued', pendingRewards: result });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.triggerAction = triggerAction;
// @desc    Get pending XP rewards
// @route   GET /api/loyalty/gamification/rewards/pending
// @access  Private
const getPendingRewards = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = yield User_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id).select('gamification.pendingRewards');
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user.gamification.pendingRewards || []);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getPendingRewards = getPendingRewards;
// @desc    Claim a pending XP reward
// @route   POST /api/loyalty/gamification/rewards/:rewardId/claim
// @access  Private
const claimXPReward = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const result = yield (0, GamificationService_1.claimXP)(req.user._id.toString(), req.params.rewardId);
        res.status(200).json(result);
    }
    catch (error) {
        console.error(error);
        if (error.message === 'Reward not found') {
            return res.status(404).json({ message: 'Reward not found' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});
exports.claimXPReward = claimXPReward;
// @desc    Daily Check-in (24-hour cooldown)
// @route   POST /api/loyalty/checkin
// @access  Private
const dailyCheckIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const user = yield User_1.default.findById(req.user._id);
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        // Check if user has already checked in within the last 24 hours
        const now = new Date();
        const lastCheckIn = user.gamification.lastDailyCheckIn;
        if (lastCheckIn) {
            const hoursSinceLastCheckIn = (now.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60);
            if (hoursSinceLastCheckIn < 24) {
                const hoursRemaining = 24 - hoursSinceLastCheckIn;
                const minutesRemaining = Math.ceil(hoursRemaining * 60);
                return res.status(400).json({
                    message: 'Already checked in today',
                    canCheckInAt: new Date(lastCheckIn.getTime() + 24 * 60 * 60 * 1000),
                    hoursRemaining: Math.floor(hoursRemaining),
                    minutesRemaining: minutesRemaining % 60,
                });
            }
        }
        // Update last check-in time
        user.gamification.lastDailyCheckIn = now;
        // Update streak
        if (lastCheckIn) {
            const daysSinceLastCheckIn = (now.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceLastCheckIn <= 1.5) {
                // Within grace period, increment streak
                user.gamification.streak.current += 1;
            }
            else {
                // Streak broken, reset to 1
                user.gamification.streak.current = 1;
            }
        }
        else {
            // First check-in
            user.gamification.streak.current = 1;
        }
        user.gamification.streak.lastActiveDate = now;
        yield user.save();
        // Queue XP reward (10 XP for daily check-in)
        const XP_AMOUNT = 10;
        const result = yield (0, GamificationService_1.queueXP)(req.user._id.toString(), XP_AMOUNT, 'daily_checkin', `Daily Check-in Day ${user.gamification.streak.current}`);
        res.status(200).json({
            message: 'Check-in successful!',
            streak: user.gamification.streak.current,
            xpEarned: XP_AMOUNT,
            nextCheckInAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
            pendingRewards: result,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.dailyCheckIn = dailyCheckIn;
// @desc    Get daily check-in status
// @route   GET /api/loyalty/checkin/status
// @access  Private
const getCheckInStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const user = yield User_1.default.findById(req.user._id).select('gamification.lastDailyCheckIn gamification.streak');
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        const now = new Date();
        const lastCheckIn = user.gamification.lastDailyCheckIn;
        let canCheckIn = true;
        let nextCheckInAt = null;
        let hoursRemaining = 0;
        let minutesRemaining = 0;
        if (lastCheckIn) {
            const hoursSinceLastCheckIn = (now.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60);
            if (hoursSinceLastCheckIn < 24) {
                canCheckIn = false;
                nextCheckInAt = new Date(lastCheckIn.getTime() + 24 * 60 * 60 * 1000);
                hoursRemaining = Math.floor(24 - hoursSinceLastCheckIn);
                minutesRemaining = Math.ceil((24 - hoursSinceLastCheckIn) * 60) % 60;
            }
        }
        res.status(200).json({
            canCheckIn,
            lastCheckIn,
            nextCheckInAt,
            hoursRemaining,
            minutesRemaining,
            currentStreak: user.gamification.streak.current,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getCheckInStatus = getCheckInStatus;
