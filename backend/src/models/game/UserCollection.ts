import mongoose, { Document, Schema } from 'mongoose';

export interface IUserCollection extends Document {
    userId: mongoose.Types.ObjectId;
    archetypeId: mongoose.Types.ObjectId;
    nickname?: string;
    level: number;
    xp: number;
    iv: {
        power: number; // 0-100% (Multiplier 0.8 - 1.2)
        charm: number;
        chaos: number;
    };
    stats: {
        power: number;
        charm: number;
        chaos: number;
    };
    isShiny: boolean;
    locationCaught: {
        latitude: number;
        longitude: number;
    };
    capturedAt: Date;
    isFavorite: boolean;
}

const UserCollectionSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        archetypeId: { type: Schema.Types.ObjectId, ref: 'UtopianArchetype', required: true },
        nickname: { type: String },
        level: { type: Number, default: 1 },
        xp: { type: Number, default: 0 },
        // IVs are multipliers (e.g. 1.05 = 5% boost) or raw adds.
        // Let's store as percentage 0-100 for simplicity in display.
        iv: {
            power: { type: Number, required: true, min: 0, max: 100 },
            charm: { type: Number, required: true, min: 0, max: 100 },
            chaos: { type: Number, required: true, min: 0, max: 100 }
        },
        // Calculated stats (Base * Level * IV) - Cached for performance
        stats: {
            power: { type: Number, required: true },
            charm: { type: Number, required: true },
            chaos: { type: Number, required: true }
        },
        isShiny: { type: Boolean, default: false },
        locationCaught: {
            latitude: Number,
            longitude: Number
        },
        capturedAt: { type: Date, default: Date.now },
        isFavorite: { type: Boolean, default: false }
    },
    { timestamps: true }
);

// Index to quickly find user's collection
UserCollectionSchema.index({ userId: 1, archetypeId: 1 });

export default mongoose.model<IUserCollection>('UserCollection', UserCollectionSchema);
