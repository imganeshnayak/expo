import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IUserMission extends Document {
    userId: Types.ObjectId;
    missionId: Types.ObjectId;
    progress: number;
    completed: boolean;
    claimed: boolean;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const UserMissionSchema: Schema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        missionId: {
            type: Schema.Types.ObjectId,
            ref: 'Mission',
            required: true,
        },
        progress: {
            type: Number,
            default: 0,
        },
        completed: {
            type: Boolean,
            default: false,
        },
        claimed: {
            type: Boolean,
            default: false,
        },
        expiresAt: Date,
    },
    {
        timestamps: true,
    }
);

// Compound index to ensure unique mission assignment per period if needed
UserMissionSchema.index({ userId: 1, missionId: 1 }, { unique: true });

export default mongoose.model<IUserMission>('UserMission', UserMissionSchema);
