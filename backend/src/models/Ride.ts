import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IRide extends Document {
    userId: Types.ObjectId;
    provider: {
        id: string; // ONDC Provider ID (e.g., Namma Yatri)
        name: string;
        type: 'auto' | 'bus' | 'car';
    };
    pickup: {
        address: string;
        coordinates: {
            latitude: number;
            longitude: number;
        };
    };
    destination: {
        address: string;
        coordinates: {
            latitude: number;
            longitude: number;
        };
    };
    pricing: {
        basePrice: number;
        discount: number;
        finalPrice: number;
        currency: string;
    };
    status: 'searching' | 'confirmed' | 'arriving' | 'ongoing' | 'completed' | 'cancelled';
    driver?: {
        name: string;
        phone: string;
        vehicleNumber: string;
        rating?: number;
    };
    otp?: string;
    estimatedTime?: number; // ETA in minutes
    ondcData?: {
        transactionId: string;
        messageId: string;
        bppId: string;
        bppUri: string;
    };
    rating?: number;
    feedback?: string;
    bookedAt: Date;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const RideSchema: Schema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        provider: {
            id: String,
            name: String,
            type: {
                type: String,
                enum: ['auto', 'bus', 'car'],
                default: 'auto',
            },
        },
        pickup: {
            address: String,
            coordinates: {
                latitude: Number,
                longitude: Number,
            },
        },
        destination: {
            address: String,
            coordinates: {
                latitude: Number,
                longitude: Number,
            },
        },
        pricing: {
            basePrice: Number,
            discount: { type: Number, default: 0 },
            finalPrice: Number,
            currency: { type: String, default: 'INR' },
        },
        status: {
            type: String,
            enum: ['searching', 'confirmed', 'arriving', 'ongoing', 'completed', 'cancelled'],
            default: 'searching',
        },
        driver: {
            name: String,
            phone: String,
            vehicleNumber: String,
            rating: Number,
        },
        otp: String,
        estimatedTime: Number,
        ondcData: {
            transactionId: String,
            messageId: String,
            bppId: String,
            bppUri: String,
        },
        rating: Number,
        feedback: String,
        bookedAt: {
            type: Date,
            default: Date.now,
        },
        completedAt: Date,
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IRide>('Ride', RideSchema);
