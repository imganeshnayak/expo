import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    username?: string;
    referralCode?: string;
    referredBy?: string;
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
        archetype?: string;
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
    pushToken?: string; // Expo Push Notification token
    loyaltyPoints: number;
    loyaltyLevel: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
    gamification: {
        xp: {
            current: number;
            lifetime: number;
        };
        rank: {
            league: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Legendary';
            tier: number; // 1, 2, 3
            displayName: string; // e.g. "Silver I"
        };
        streak: {
            current: number;
            lastActiveDate: Date;
        };
        unlockedFeatures: string[];
        skillTree: Map<string, number>;
        pendingRewards: Array<{
            _id?: mongoose.Types.ObjectId;
            title: string;
            xp: number;
            source: string;
            createdAt: Date;
        }>;
        lastDailyCheckIn?: Date;
    };
    claimedDeals: Array<{
        dealId: mongoose.Types.ObjectId;
        claimedAt: Date;
        redeemedAt?: Date;
        savings: number;
        redemptionCode: string;
        status: 'pending' | 'redeemed' | 'expired';
    }>;
    favoritedDeals: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
    matchPassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
    {
        username: {
            type: String,
            unique: true,
            sparse: true, // Allows null/undefined values for existing users
            trim: true,
            minlength: 3,
        },
        referralCode: {
            type: String,
            unique: true,
            sparse: true,
        },
        referredBy: {
            type: String,
        },
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
            archetype: String,
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
        pushToken: String, // Expo Push Notification token
        loyaltyPoints: {
            type: Number,
            default: 0,
        },
        loyaltyLevel: {
            type: String,
            enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
            default: 'Bronze',
        },
        gamification: {
            xp: {
                current: { type: Number, default: 0 },
                lifetime: { type: Number, default: 0 },
            },
            rank: {
                league: {
                    type: String,
                    enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Legendary'],
                    default: 'Bronze',
                },
                tier: { type: Number, default: 1 },
                displayName: { type: String, default: 'Bronze I' },
            },
            streak: {
                current: { type: Number, default: 0 },
                lastActiveDate: { type: Date, default: Date.now },
            },
            unlockedFeatures: [String],
            skillTree: {
                type: Map,
                of: Number,
                default: {},
            },
            pendingRewards: [
                {
                    title: String,
                    xp: Number,
                    source: String,
                    createdAt: { type: Date, default: Date.now },
                }
            ],
            lastDailyCheckIn: { type: Date },
        },
        claimedDeals: [
            {
                dealId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Campaign',
                },
                claimedAt: {
                    type: Date,
                    default: Date.now,
                },
                redeemedAt: Date,
                savings: {
                    type: Number,
                    default: 0,
                },
                redemptionCode: {
                    type: String,
                    unique: true,
                    sparse: true,
                },
                status: {
                    type: String,
                    enum: ['pending', 'redeemed', 'expired'],
                    default: 'pending',
                },
            },
        ],
        favoritedDeals: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Campaign',
            },
        ],
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
