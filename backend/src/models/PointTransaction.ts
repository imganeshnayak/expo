import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPointTransaction extends Document {
    userId: Types.ObjectId;
    type: 'earn' | 'redeem';
    amount: number;
    description: string; // e.g., "Ride Completion", "Referral Bonus"
    source?: 'ride' | 'deal' | 'mission' | 'referral';
    referenceId?: string; // ID of the ride/deal/mission
    createdAt: Date;
}

const PointTransactionSchema: Schema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        type: {
            type: String,
            enum: ['earn', 'redeem'],
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        description: String,
        source: {
            type: String,
            enum: ['ride', 'deal', 'mission', 'referral'],
        },
        referenceId: String,
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

export default mongoose.model<IPointTransaction>('PointTransaction', PointTransactionSchema);
