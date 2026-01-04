import { Request, Response } from 'express';
import Group from '../models/Group';
import GroupChat from '../models/GroupChat';
import User from '../models/User';

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private
export const createGroup = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { name, emoji, description, purpose, memberIds } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Group name is required' });
        }

        const members = [
            { userId, role: 'admin', joinedAt: new Date() },
            ...(memberIds || []).map((id: string) => ({ userId: id, role: 'member', joinedAt: new Date() })),
        ];

        const group = await Group.create({
            name,
            emoji,
            description,
            purpose,
            createdBy: userId,
            members,
        });

        // Create initial system message
        await GroupChat.create({
            groupId: group._id,
            senderId: userId,
            message: `Group "${name}" created!`,
            type: 'system',
        });

        res.status(201).json({ success: true, data: group });
    } catch (error: any) {
        console.error('Error creating group:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user's groups
// @route   GET /api/groups
// @access  Private
export const getMyGroups = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;

        const groups = await Group.find({ 'members.userId': userId })
            .sort({ updatedAt: -1 })
            .populate('members.userId', 'profile.name profile.avatar');

        res.json({ success: true, data: groups });
    } catch (error: any) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get group details and messages
// @route   GET /api/groups/:id
// @access  Private
export const getGroupDetails = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const groupId = req.params.id;

        const group = await Group.findById(groupId)
            .populate('members.userId', 'profile.name profile.avatar');

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if user is member
        const isMember = group.members.some(m => m.userId._id.toString() === userId.toString());
        if (!isMember) {
            return res.status(403).json({ message: 'Not a member of this group' });
        }

        const messages = await GroupChat.find({ groupId })
            .sort({ createdAt: 1 })
            .populate('senderId', 'profile.name profile.avatar');

        res.json({ success: true, data: { group, messages } });
    } catch (error: any) {
        console.error('Error fetching group details:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Send a message
// @route   POST /api/groups/:id/messages
// @access  Private
export const sendMessage = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const groupId = req.params.id;
        const { message, type, metadata } = req.body;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const newMsg = await GroupChat.create({
            groupId,
            senderId: userId,
            message,
            type: type || 'text',
            metadata,
            readBy: [userId],
        });

        // Update group updated time
        await Group.findByIdAndUpdate(groupId, { updatedAt: new Date() });

        const populatedMsg = await newMsg.populate('senderId', 'profile.name profile.avatar');

        res.status(201).json({ success: true, data: populatedMsg });
    } catch (error: any) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
