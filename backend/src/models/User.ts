import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    email: string;
    phone: string;
    password?: string;
    profile: {
        name: string;
        avatar?: string;
        location?: {
            address: string;
            coordinates: {
                latitude: number;
                longitude: number;
            };
        };
        preferences: {
            notifications: boolean;
            locationServices: boolean;
            language: string;
        };
    };
    aiProfile?: {
        personality: string[];
        interests: string[];
        spendingHabits: Record<string, any>;
        lastUpdated: Date;
    };
    memberSince: Date;
    isVerified: boolean;
    isActive: boolean;
    refreshToken?: string;
    loyaltyPoints: number;
    loyaltyLevel: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
    matchPassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'],
        },
        phone: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false, // Don't return password by default
        },
        profile: {
            name: {
                type: String,
                required: true,
            },
            avatar: {
                type: String,
                default: 'default-avatar.png',
            },
            location: {
                address: String,
                coordinates: {
                    latitude: Number,
                    longitude: Number,
                },
            },
            preferences: {
                notifications: {
                    type: Boolean,
                    default: true,
                },
                locationServices: {
                    type: Boolean,
                    default: false,
                },
                language: {
                    type: String,
                    default: 'en',
                },
            },
        },
        aiProfile: {
            personality: [String],
            interests: [String],
            spendingHabits: {
                type: Map,
                of: String,
            },
            lastUpdated: Date,
        },
        memberSince: {
            type: Date,
            default: Date.now,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        refreshToken: String,
        loyaltyPoints: {
            type: Number,
            default: 0,
        },
        loyaltyLevel: {
            type: String,
            enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
            default: 'Bronze',
        },
    },
    {
        timestamps: true,
    }
);

// Encrypt password using bcrypt
UserSchema.pre<IUser>('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    if (this.password) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
