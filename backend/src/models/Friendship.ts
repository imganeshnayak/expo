import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IFriendship extends Document {
    requester: Types.ObjectId;
    recipient: Types.ObjectId;
    status: 'pending' | 'accepted' | 'blocked';
    createdAt: Date;
    updatedAt: Date;
}

const FriendshipSchema: Schema = new Schema(
    {
        requester: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        recipient: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'blocked'],
            default: 'pending',
        },
    },
    {
        timestamps: true,
    }
);

// Ensure unique friendship pair
FriendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });

export default mongoose.model<IFriendship>('Friendship', FriendshipSchema);
