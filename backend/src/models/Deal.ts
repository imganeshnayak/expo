import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IDeal extends Document {
    merchantId: Types.ObjectId;
    title: string;
    description: string;
    category: string;
    type: 'percentage' | 'fixed' | 'bogo' | 'cashback';
    discount: {
        value: number;
        maxDiscount?: number;
        minPurchase?: number;
    };
    images: string[];
    terms: string[];
    validFrom: Date;
    validUntil: Date;
    usageLimit: {
        total: number;
        perUser: number;
        used: number;
    };
    location?: {
        address: string;
        coordinates: {
            latitude: number;
            longitude: number;
        };
        radius: number;
    };
    isActive: boolean;
    isFeatured: boolean;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

const DealSchema: Schema = new Schema(
    {
        merchantId: {
            type: Schema.Types.ObjectId,
            ref: 'Merchant',
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: String,
        category: String,
        type: {
            type: String,
            enum: ['percentage', 'fixed', 'bogo', 'cashback'],
            required: true,
        },
        discount: {
            value: { type: Number, required: true },
            maxDiscount: Number,
            minPurchase: Number,
        },
        images: [String],
        terms: [String],
        validFrom: {
            type: Date,
            default: Date.now,
        },
        validUntil: {
            type: Date,
            required: true,
        },
        usageLimit: {
            total: { type: Number, default: 100 },
            perUser: { type: Number, default: 1 },
            used: { type: Number, default: 0 },
        },
        location: {
            address: String,
            coordinates: {
                latitude: Number,
                longitude: Number,
            },
            radius: Number,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        tags: [String],
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IDeal>('Deal', DealSchema);
