import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IStampCard extends Document {
    userId: Types.ObjectId;
    merchantId: Types.ObjectId;
    stampsCollected: number;
    stampsRequired: number;
    reward: string;
    rewardValue: number;
    isCompleted: boolean;
    completedAt?: Date;
    redeemedAt?: Date;
    expiresAt?: Date;
    stampDesign: string;
    tierLevel?: string;
}

const StampCardSchema: Schema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        merchantId: {
            type: Schema.Types.ObjectId,
            ref: 'Merchant',
            required: true,
        },
        stampsCollected: {
            type: Number,
            default: 0,
        },
        stampsRequired: {
            type: Number,
            default: 10,
        },
        reward: {
            type: String,
            required: true,
        },
        rewardValue: {
            type: Number,
            default: 0,
        },
        isCompleted: {
            type: Boolean,
            default: false,
        },
        completedAt: Date,
        redeemedAt: Date,
        expiresAt: Date,
        stampDesign: {
            type: String,
            default: 'circle',
        },
        tierLevel: String,
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
StampCardSchema.index({ userId: 1, merchantId: 1 });
StampCardSchema.index({ merchantId: 1, isCompleted: 1 });

export default mongoose.model<IStampCard>('StampCard', StampCardSchema);
