import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAnalytics extends Document {
    merchantId: Types.ObjectId;
    period: 'day' | 'week' | 'month';
    periodStart: Date;
    periodEnd: Date;
    metrics: {
        totalCustomers: number;
        newCustomers: number;
        returningCustomers: number;
        totalRevenue: number;
        averageOrderValue: number;
        customerAcquisitionCost: number;
        customerLifetimeValue: number;
        churnRate: number;
        activeCampaigns: number;
        campaignRevenue: number;
        campaignROI: number;
        topItems: Array<{
            item: string;
            orders: number;
            revenue: number;
        }>;
        peakHours: Array<{
            hour: string;
            visits: number;
            revenue: number;
        }>;
        peakDays: Array<{
            day: string;
            visits: number;
            revenue: number;
        }>;
    };
}

const AnalyticsSchema: Schema = new Schema(
    {
        merchantId: {
            type: Schema.Types.ObjectId,
            ref: 'Merchant',
            required: true,
        },
        period: {
            type: String,
            enum: ['day', 'week', 'month'],
            required: true,
        },
        periodStart: {
            type: Date,
            required: true,
        },
        periodEnd: {
            type: Date,
            required: true,
        },
        metrics: {
            totalCustomers: { type: Number, default: 0 },
            newCustomers: { type: Number, default: 0 },
            returningCustomers: { type: Number, default: 0 },
            totalRevenue: { type: Number, default: 0 },
            averageOrderValue: { type: Number, default: 0 },
            customerAcquisitionCost: { type: Number, default: 0 },
            customerLifetimeValue: { type: Number, default: 0 },
            churnRate: { type: Number, default: 0 },
            activeCampaigns: { type: Number, default: 0 },
            campaignRevenue: { type: Number, default: 0 },
            campaignROI: { type: Number, default: 0 },
            topItems: [{
                item: String,
                orders: Number,
                revenue: Number,
            }],
            peakHours: [{
                hour: String,
                visits: Number,
                revenue: Number,
            }],
            peakDays: [{
                day: String,
                visits: Number,
                revenue: Number,
            }],
        },
    },
    {
        timestamps: true,
    }
);

// Unique index for period
AnalyticsSchema.index({ merchantId: 1, period: 1, periodStart: 1 }, { unique: true });

export default mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);
