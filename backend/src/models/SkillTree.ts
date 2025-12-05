import mongoose, { Document, Schema } from 'mongoose';

export interface ISkillNode {
    level: number;
    name: string; // e.g., "Street Food"
    description: string;
    requirements: {
        visits?: number;
        checkins?: number;
        reviews?: number;
        missions?: number;
        xp?: number;
    };
    rewards: {
        badge?: string;
        dealId?: string;
        xpBonus?: number;
    };
}

export interface ISkillTree extends Document {
    category: string; // e.g., "Food", "Fashion"
    nodes: ISkillNode[];
    isActive: boolean;
}

const SkillNodeSchema = new Schema({
    level: { type: Number, required: true },
    name: { type: String, required: true },
    description: String,
    requirements: {
        visits: Number,
        checkins: Number,
        reviews: Number,
        missions: Number,
        xp: Number,
    },
    rewards: {
        badge: String,
        dealId: String,
        xpBonus: Number,
    },
});

const SkillTreeSchema: Schema = new Schema(
    {
        category: {
            type: String,
            required: true,
            unique: true,
        },
        nodes: [SkillNodeSchema],
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<ISkillTree>('SkillTree', SkillTreeSchema);
