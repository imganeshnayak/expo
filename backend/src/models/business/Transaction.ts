import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITransaction extends Document {
    userId: Types.ObjectId;
    merchantId: Types.ObjectId;
    dealId?: Types.ObjectId;
    campaignId?: Types.ObjectId;
    type: 'purchase' | 'cashback' | 'refund';
    amount: number;
    items?: Record<string, any>[];
    paymentMethod: string;
    status: 'pending' | 'completed' | 'failed';
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
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
        dealId: {
            type: Schema.Types.ObjectId,
            ref: 'Deal',
        },
        campaignId: {
            type: Schema.Types.ObjectId,
            ref: 'Campaign',
        },
        type: {
            type: String,
            enum: ['purchase', 'cashback', 'refund'],
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        items: [Schema.Types.Mixed],
        paymentMethod: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'pending',
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

// Indexes
TransactionSchema.index({ merchantId: 1, createdAt: -1 });
TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ merchantId: 1, status: 1 });

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
