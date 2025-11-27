import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITransaction {
    transactionId: string;
    type: 'CASHBACK' | 'RIDE_PAYMENT' | 'WALLET_TOPUP' | 'WITHDRAWAL' | 'DEAL_PAYMENT';
    amount: number;
    merchant?: string;
    description: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    metadata?: Record<string, any>;
    createdAt: Date;
}

export interface IWallet extends Document {
    userId: Types.ObjectId;
    balance: number;
    currency: string;
    transactions: ITransaction[];
    totalCashback: number;
    totalSpent: number;
    createdAt: Date;
    updatedAt: Date;
}

const WalletSchema: Schema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        balance: {
            type: Number,
            default: 0,
        },
        currency: {
            type: String,
            default: 'INR',
        },
        transactions: [
            {
                transactionId: {
                    type: String,
                    required: true,
                    unique: true,
                },
                type: {
                    type: String,
                    enum: ['CASHBACK', 'RIDE_PAYMENT', 'WALLET_TOPUP', 'WITHDRAWAL', 'DEAL_PAYMENT'],
                    required: true,
                },
                amount: {
                    type: Number,
                    required: true,
                },
                merchant: String,
                description: String,
                status: {
                    type: String,
                    enum: ['pending', 'completed', 'failed', 'refunded'],
                    default: 'pending',
                },
                metadata: Map,
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        totalCashback: {
            type: Number,
            default: 0,
        },
        totalSpent: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IWallet>('Wallet', WalletSchema);
