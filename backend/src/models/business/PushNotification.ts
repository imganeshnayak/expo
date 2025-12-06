import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPushNotification extends Document {
    merchantId: Types.ObjectId;
    title: string;
    message: string;
    audience: 'all' | 'segment' | 'individual';
    targetSegments?: string[]; // ['vip', 'regular', 'new', 'at_risk']
    targetUserIds?: Types.ObjectId[];
    sentCount: number;
    deliveredCount: number;
    failedCount: number;
    status: 'draft' | 'sending' | 'sent' | 'failed';
    scheduledFor?: Date;
    sentAt?: Date;
    metadata?: Record<string, any>;
}

const PushNotificationSchema: Schema = new Schema(
    {
        merchantId: {
            type: Schema.Types.ObjectId,
            ref: 'Merchant',
            required: true,
        },
        title: {
            type: String,
            required: true,
            maxlength: 100,
        },
        message: {
            type: String,
            required: true,
            maxlength: 500,
        },
        audience: {
            type: String,
            enum: ['all', 'segment', 'individual'],
            required: true,
        },
        targetSegments: [{
            type: String,
            enum: ['vip', 'regular', 'new', 'at_risk'],
        }],
        targetUserIds: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
        }],
        sentCount: {
            type: Number,
            default: 0,
        },
        deliveredCount: {
            type: Number,
            default: 0,
        },
        failedCount: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ['draft', 'sending', 'sent', 'failed'],
            default: 'draft',
        },
        scheduledFor: Date,
        sentAt: Date,
        metadata: {
            type: Map,
            of: Schema.Types.Mixed,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient queries
PushNotificationSchema.index({ merchantId: 1, createdAt: -1 });
PushNotificationSchema.index({ merchantId: 1, status: 1 });

export default mongoose.model<IPushNotification>('PushNotification', PushNotificationSchema);
