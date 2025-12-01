import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICampaignEvent extends Document {
    campaignId: Types.ObjectId;
    userId?: Types.ObjectId;
    eventType: 'impression' | 'click' | 'conversion';
    revenue?: number;
    metadata?: Record<string, any>;
}

const CampaignEventSchema: Schema = new Schema(
    {
        campaignId: {
            type: Schema.Types.ObjectId,
            ref: 'Campaign',
            required: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        eventType: {
            type: String,
            enum: ['impression', 'click', 'conversion'],
            required: true,
        },
        revenue: {
            type: Number,
            default: 0,
        },
        metadata: {
            type: Map,
            of: Schema.Types.Mixed,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
CampaignEventSchema.index({ campaignId: 1, eventType: 1 });
CampaignEventSchema.index({ campaignId: 1, createdAt: -1 });

export default mongoose.model<ICampaignEvent>('CampaignEvent', CampaignEventSchema);
