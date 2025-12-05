import mongoose, { Document, Schema } from 'mongoose';

export interface IMission extends Document {
    title: string;
    description: string;
    type: 'ride_count' | 'spend_amount' | 'referral_count' | 'profile_completion' | 'visit' | 'scan' | 'upload_bill' | 'share' | 'review';
    requirement: number; // e.g., 5 rides
    rewardPoints: number;
    xpReward: number;
    frequency: 'daily' | 'weekly' | 'one_time';
    minRank?: string; // e.g. "Silver I"
    icon: string;
    isActive: boolean;
    startDate?: Date;
    endDate?: Date;
    createdAt: Date;
    updatedAt: Date;

    // Frontend specific
    category: 'food' | 'entertainment' | 'wellness' | 'shopping' | 'adventure';
    categoryColor: string;
    difficulty: 'easy' | 'medium' | 'hard';
    timeEstimate: string;
    estimatedSavings: number;
    steps: Array<{
        id: string;
        type: 'ride' | 'deal' | 'visit' | 'scan';
        dealId?: string;
        merchantId?: string;
        instructions: string;
        completed: boolean;
        actionRequired: boolean;
        deepLink?: string;
    }>;
}

const MissionSchema: Schema = new Schema(
    {
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
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IMission>('Mission', MissionSchema);
