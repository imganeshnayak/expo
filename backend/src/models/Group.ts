import mongoose, { Document, Schema } from 'mongoose';

export interface IGroup extends Document {
    name: string;
    emoji: string;
    description?: string;
    members: {
        userId: mongoose.Types.ObjectId;
        role: 'admin' | 'member';
        joinedAt: Date;
        contribution: number;
    }[];
    createdBy: mongoose.Types.ObjectId;
    purpose: 'hanging_out' | 'food_exploration' | 'weekend_plans' | 'custom';
    activeMission?: {
        missionId: string;
        title: string;
        progress: number;
        target: number;
        expiresAt: Date;
    };
    stats: {
        totalSavings: number;
        missionsCompleted: number;
        dealsShared: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const GroupSchema: Schema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        emoji: { type: String, default: '👥' },
        description: { type: String },
        members: [
            {
                userId: { type: Schema.Types.ObjectId, ref: 'User' },
                role: { type: String, enum: ['admin', 'member'], default: 'member' },
                joinedAt: { type: Date, default: Date.now },
                contribution: { type: Number, default: 0 },
            },
        ],
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        purpose: {
            type: String,
            enum: ['hanging_out', 'food_exploration', 'weekend_plans', 'custom'],
            default: 'custom',
        },
        activeMission: {
            missionId: String,
            title: String,
            progress: { type: Number, default: 0 },
            target: Number,
            expiresAt: Date,
        },
        stats: {
            totalSavings: { type: Number, default: 0 },
            missionsCompleted: { type: Number, default: 0 },
            dealsShared: { type: Number, default: 0 },
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IGroup>('Group', GroupSchema);
