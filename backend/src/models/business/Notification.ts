import mongoose, { Document, Schema, Types } from 'mongoose';

export interface INotification extends Document {
    merchantId: Types.ObjectId;
    type: 'campaign' | 'customer' | 'system' | 'alert';
    priority: 'high' | 'medium' | 'low';
    title: string;
    message: string;
    actionUrl?: string;
    metadata?: Record<string, any>;
    read: boolean;
}

const NotificationSchema: Schema = new Schema(
    {
        merchantId: {
            type: Schema.Types.ObjectId,
            ref: 'Merchant',
            required: true,
        },
        type: {
            type: String,
            enum: ['campaign', 'customer', 'system', 'alert'],
            required: true,
        },
        priority: {
            type: String,
            enum: ['high', 'medium', 'low'],
            default: 'medium',
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        actionUrl: String,
        metadata: {
            type: Map,
            of: Schema.Types.Mixed,
        },
        read: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
NotificationSchema.index({ merchantId: 1, read: 1 });
NotificationSchema.index({ merchantId: 1, createdAt: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
