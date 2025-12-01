import mongoose, { Document, Schema } from 'mongoose';

export interface IMerchant extends Document {
    name: string;
    description: string;
    category: string[];
    logo: string;
    images: string[];
    contact: {
        email: string;
        phone: string;
        website?: string;
    };
    location: {
        address: string;
        coordinates: {
            latitude: number;
            longitude: number;
        };
    };
    rating: {
        average: number;
        count: number;
    };
    isVerified: boolean;
    isActive: boolean;
    businessHours?: Record<string, any>;
    socialMedia?: Record<string, string>;
    paymentMethods?: string[];
    createdAt: Date;
    updatedAt: Date;
}

const MerchantSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: String,
        category: [String],
        logo: String,
        images: [String],
        contact: {
            email: String,
            phone: String,
            website: String,
        },
        location: {
            address: String,
            coordinates: {
                latitude: Number,
                longitude: Number,
            },
        },
        rating: {
            average: { type: Number, default: 0 },
            count: { type: Number, default: 0 },
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        businessHours: Map,
        socialMedia: Map,
        paymentMethods: [String],
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IMerchant>('Merchant', MerchantSchema);
