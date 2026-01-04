"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const MissionSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    type: {
        type: String,
        enum: ['ride_count', 'spend_amount', 'referral_count', 'profile_completion', 'visit', 'scan', 'upload_bill', 'share', 'review'],
        required: true,
    },
    requirement: {
        type: Number,
        required: true,
    },
    rewardPoints: {
        type: Number,
        required: true,
    },
    xpReward: {
        type: Number,
        required: true,
        default: 0,
    },
    frequency: {
        type: String,
        enum: ['daily', 'weekly', 'one_time'],
        default: 'one_time',
    },
    minRank: String,
    icon: String,
    isActive: {
        type: Boolean,
        default: true,
    },
    startDate: Date,
    endDate: Date,
    // Frontend specific fields
    category: {
        type: String,
        enum: ['food', 'entertainment', 'wellness', 'shopping', 'adventure'],
        default: 'adventure'
    },
    categoryColor: {
        type: String,
        default: '#E74C3C'
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    timeEstimate: {
        type: String,
        default: '1-2 hours'
    },
    estimatedSavings: {
        type: Number,
        default: 0
    },
    steps: [{
            id: String,
            type: { type: String, enum: ['ride', 'deal', 'visit', 'scan'] },
            dealId: String,
            merchantId: String,
            instructions: String,
            completed: { type: Boolean, default: false },
            actionRequired: { type: Boolean, default: true },
            deepLink: String
        }]
}, {
    timestamps: true,
});
exports.default = mongoose_1.default.model('Mission', MissionSchema);
