import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICampaign extends Document {
    merchantId: Types.ObjectId;
    name: string;
    type: 'stamp_card' | 'discount' | 'ride_reimbursement' | 'mission' | 'combo';
    category: 'acquisition' | 'retention' | 'reactivation' | 'loyalty';
    status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
    budget: {
        total: number;
        spent: number;
        dailyLimit?: number;
    };
    targeting: {
        audience: 'all' | 'new' | 'returning' | 'vip';
        segments: Types.ObjectId[];
        location?: string;
        timing: 'always' | 'schedule' | 'event';
        schedule?: {
            startDate: Date;
            endDate: Date;
            timeSlots: string[];
        };
    };
    offer: {
        discountPercent?: number;
        bonusStamps?: number;
        cashbackAmount?: number;
        freeItem?: string;
    };
    performance: {
        impressions: number;
        conversions: number;
        claims?: number;
        revenue: number;
        roi: number;
        costPerAcquisition: number;
        clickThroughRate: number;
    };
    // Frontend Deal Interface Fields
    title: string;
    description: string;
    consumerCategory: string;
    images: string[];
    termsAndConditions: string[];
    pricing: {
        originalPrice: number;
        discountedPrice: number;
    };
    maxRedemptions?: number;
}

const CampaignSchema: Schema = new Schema(
    {
        merchantId: {
            type: Schema.Types.ObjectId,
            ref: 'Merchant',
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['stamp_card', 'discount', 'ride_reimbursement', 'mission', 'combo'],
            required: true,
        },
        category: {
            type: String,
            enum: ['acquisition', 'retention', 'reactivation', 'loyalty'],
            required: true,
        },
        status: {
            type: String,
            enum: ['draft', 'active', 'paused', 'completed', 'archived'],
            default: 'draft',
        },
        budget: {
            total: {
                type: Number,
                default: 0,
            },
            spent: {
                type: Number,
                default: 0,
            },
            dailyLimit: Number,
        },
        targeting: {
            audience: {
                type: String,
                enum: ['all', 'new', 'returning', 'vip'],
                default: 'all',
            },
            segments: [{
                type: Schema.Types.ObjectId,
                ref: 'CustomerSegment',
            }],
            location: String,
            timing: {
                type: String,
                enum: ['always', 'schedule', 'event'],
                default: 'always',
            },
            schedule: {
                startDate: Date,
                endDate: Date,
                timeSlots: [String],
            },
        },
        offer: {
            discountPercent: Number,
            bonusStamps: Number,
            cashbackAmount: Number,
            freeItem: String,
        },
        performance: {
            impressions: {
                type: Number,
                default: 0,
            },
            conversions: {
                type: Number,
                default: 0,
            },
            claims: {
                type: Number,
                default: 0,
            },
            revenue: {
                type: Number,
                default: 0,
            },
            roi: {
                type: Number,
                default: 0,
            },
            costPerAcquisition: {
                type: Number,
                default: 0,
            },
            clickThroughRate: {
                type: Number,
                default: 0,
            },
        },
        // Frontend Deal Interface Fields
        title: String,
        description: String,
        consumerCategory: String,
        images: [String],
        termsAndConditions: [String],
        pricing: {
            originalPrice: Number,
            discountedPrice: Number,
        },
        maxRedemptions: Number,
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
CampaignSchema.index({ merchantId: 1, status: 1 });
CampaignSchema.index({ merchantId: 1, type: 1 });

export default mongoose.model<ICampaign>('Campaign', CampaignSchema);
