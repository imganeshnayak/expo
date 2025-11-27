import mongoose, { Document, Schema } from 'mongoose';

export interface IMission extends Document {
    title: string;
    description: string;
    type: 'ride_count' | 'spend_amount' | 'referral_count' | 'profile_completion';
    requirement: number; // e.g., 5 rides
    rewardPoints: number;
    icon: string;
    isActive: boolean;
    startDate?: Date;
    endDate?: Date;
    createdAt: Date;
    updatedAt: Date;
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
            enum: ['ride_count', 'spend_amount', 'referral_count', 'profile_completion'],
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
        icon: String,
        isActive: {
            type: Boolean,
            default: true,
        },
        startDate: Date,
        endDate: Date,
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IMission>('Mission', MissionSchema);
