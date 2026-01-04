import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISocialActivity extends Document {
    user: Types.ObjectId;
    type: 'mission_complete' | 'deal_claim' | 'badge_unlock' | 'level_up';
    data: {
        title: string;
        description?: string;
        targetId?: string; // ID of the mission/deal/badge
        image?: string;
    };
    likes: Types.ObjectId[];
    createdAt: Date;
}

const SocialActivitySchema: Schema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        type: {
            type: String,
            enum: ['mission_complete', 'deal_claim', 'badge_unlock', 'level_up'],
            required: true,
        },
        data: {
            title: { type: String, required: true },
            description: String,
            targetId: String,
            image: String,
        },
        likes: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
        }],
    },
    {
        timestamps: true,
    }
);

// Index for efficient feed queries
SocialActivitySchema.index({ user: 1, createdAt: -1 });

export default mongoose.model<ISocialActivity>('SocialActivity', SocialActivitySchema);
