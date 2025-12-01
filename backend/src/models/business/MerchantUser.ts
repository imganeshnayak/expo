import mongoose, { Document, Schema, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IMerchantUser extends Document {
    merchantId: Types.ObjectId;
    email: string;
    password: string;
    role: 'owner' | 'manager' | 'staff';
    permissions: string[];
    profile: {
        name: string;
        avatar?: string;
        phone: string;
    };
    settings: {
        notifications: boolean;
        emailNotifications: boolean;
        darkMode: boolean;
        language: string;
        timezone: string;
    };
    lastLogin?: Date;
    isActive: boolean;
    refreshToken?: string;
    matchPassword(enteredPassword: string): Promise<boolean>;
}

const MerchantUserSchema: Schema = new Schema(
    {
        merchantId: {
            type: Schema.Types.ObjectId,
            ref: 'Merchant',
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'],
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false,
        },
        role: {
            type: String,
            enum: ['owner', 'manager', 'staff'],
            default: 'owner',
        },
        permissions: [String],
        profile: {
            name: {
                type: String,
                required: true,
            },
            avatar: String,
            phone: String,
        },
        settings: {
            notifications: {
                type: Boolean,
                default: true,
            },
            emailNotifications: {
                type: Boolean,
                default: true,
            },
            darkMode: {
                type: Boolean,
                default: true,
            },
            language: {
                type: String,
                default: 'en',
            },
            timezone: {
                type: String,
                default: 'UTC',
            },
        },
        lastLogin: Date,
        isActive: {
            type: Boolean,
            default: true,
        },
        refreshToken: String,
    },
    {
        timestamps: true,
    }
);

// Encrypt password
MerchantUserSchema.pre<IMerchantUser>('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match password
MerchantUserSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model<IMerchantUser>('MerchantUser', MerchantUserSchema);
