import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICustomer extends Document {
    userId: Types.ObjectId;
    merchantId: Types.ObjectId;
    segment: 'vip' | 'regular' | 'new' | 'at_risk';
    lifetimeValue: number;
    visitCount: number;
    averageSpend: number;
    firstVisit: Date;
    lastVisit: Date;
    favoriteItems: string[];
    tags: string[];
    notes: string;
    communication: {
        pushEnabled: boolean;
        smsEnabled: boolean;
        lastContact?: Date;
    };
}

const CustomerSchema: Schema = new Schema(
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
        segment: {
            type: String,
            enum: ['vip', 'regular', 'new', 'at_risk'],
            default: 'new',
        },
        lifetimeValue: {
            type: Number,
            default: 0,
        },
        visitCount: {
            type: Number,
            default: 0,
        },
        averageSpend: {
            type: Number,
            default: 0,
        },
        firstVisit: {
            type: Date,
            default: Date.now,
        },
        lastVisit: {
            type: Date,
            default: Date.now,
        },
        favoriteItems: [String],
        tags: [String],
        notes: String,
        communication: {
            pushEnabled: {
                type: Boolean,
                default: true,
            },
            smsEnabled: {
                type: Boolean,
                default: true,
            },
            lastContact: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
CustomerSchema.index({ merchantId: 1, userId: 1 }, { unique: true });
CustomerSchema.index({ merchantId: 1, segment: 1 });
CustomerSchema.index({ merchantId: 1, lastVisit: 1 });

export default mongoose.model<ICustomer>('Customer', CustomerSchema);
