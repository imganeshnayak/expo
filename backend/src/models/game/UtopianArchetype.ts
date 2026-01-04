import mongoose, { Document, Schema } from 'mongoose';

export interface IUtopianArchetype extends Document {
    name: string;
    rarity: 'Common' | 'Rare' | 'Epic' | 'Mythic' | 'Legendary';
    baseStats: {
        power: number;
        charm: number;
        chaos: number;
    };
    visuals: {
        spriteUrl: string;
        color: string;
        icon: string;
    };
    lore: {
        backstory: string;
        personality: string;
    };
    spawnConditions: {
        timeOfDay: 'Day' | 'Night' | 'Any';
        minUserLevel?: string; // Rank Name e.g. 'Bronze I', 'Silver II'
    };
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const UtopianArchetypeSchema: Schema = new Schema(
    {
        name: { type: String, required: true, unique: true },
        rarity: {
            type: String,
            required: true,
            enum: ['Common', 'Rare', 'Epic', 'Mythic', 'Legendary'],
            index: true
        },
        baseStats: {
            power: { type: Number, required: true, min: 0, max: 100 },
            charm: { type: Number, required: true, min: 0, max: 100 },
            chaos: { type: Number, required: true, min: 0, max: 100 }
        },
        visuals: {
            spriteUrl: { type: String, required: true },
            color: { type: String, required: true }, // Hex code
            icon: { type: String, required: true }
        },
        lore: {
            backstory: { type: String, required: true },
            personality: { type: String, required: true }
        },
        spawnConditions: {
            timeOfDay: {
                type: String,
                enum: ['Day', 'Night', 'Any'],
                default: 'Any'
            },
            minUserLevel: { type: String }
        },
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

export default mongoose.model<IUtopianArchetype>('UtopianArchetype', UtopianArchetypeSchema);
