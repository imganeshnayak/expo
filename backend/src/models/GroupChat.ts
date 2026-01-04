import mongoose, { Document, Schema } from 'mongoose';

export interface IGroupChat extends Document {
    groupId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    message: string;
    type: 'text' | 'deal_share' | 'mission_invite' | 'system';
    metadata?: any;
    readBy: mongoose.Types.ObjectId[];
    createdAt: Date;
}

const GroupChatSchema: Schema = new Schema(
    {
        groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
        senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        message: { type: String, required: true },
        type: {
            type: String,
            enum: ['text', 'deal_share', 'mission_invite', 'system'],
            default: 'text',
        },
        metadata: { type: Schema.Types.Mixed }, // Flexible for deal details etc.
        readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IGroupChat>('GroupChat', GroupChatSchema);
