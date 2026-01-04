import { Request, Response } from 'express';
import User from '../models/User';
import Friendship from '../models/Friendship';
import mongoose from 'mongoose';

// @desc    Send friend request
// @route   POST /api/friends/request
// @access  Private
export const sendFriendRequest = async (req: Request, res: Response) => {
    try {
        const requesterId = (req as any).user._id;
        const { email, username } = req.body;

        if (!email && !username) {
            return res.status(400).json({ message: 'Email or Username is required' });
        }

        let recipient;
        if (email) {
            recipient = await User.findOne({ email });
        } else if (username) {
            recipient = await User.findOne({ username });
        }

        if (!recipient) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (recipient._id.toString() === requesterId.toString()) {
            return res.status(400).json({ message: 'Cannot send friend request to yourself' });
        }

        // Check if friendship already exists
        const existingFriendship = await Friendship.findOne({
            $or: [
                { requester: requesterId, recipient: recipient._id },
                { requester: recipient._id, recipient: requesterId },
            ],
        });

        if (existingFriendship) {
            if (existingFriendship.status === 'pending') {
                return res.status(400).json({ message: 'Friend request already pending' });
            }
            if (existingFriendship.status === 'accepted') {
                return res.status(400).json({ message: 'Already friends' });
            }
            if (existingFriendship.status === 'blocked') {
                return res.status(400).json({ message: 'Cannot send request' });
            }
        }

        const friendship = await Friendship.create({
            requester: requesterId,
            recipient: recipient._id,
            status: 'pending',
        });

        res.status(201).json({
            success: true,
            message: 'Friend request sent',
            friendship,
        });
    } catch (error: any) {
        console.error('Error sending friend request:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Respond to friend request
// @route   PUT /api/friends/respond
// @access  Private
export const respondToFriendRequest = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { requestId, action } = req.body; // action: 'accept' | 'reject'

        if (!requestId || !action) {
            return res.status(400).json({ message: 'Request ID and action are required' });
        }

        const friendship = await Friendship.findById(requestId);

        if (!friendship) {
            return res.status(404).json({ message: 'Friend request not found' });
        }

        // Verify that the user is the recipient
        if (friendship.recipient.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Not authorized to respond to this request' });
        }

        if (friendship.status !== 'pending') {
            return res.status(400).json({ message: 'Request is not pending' });
        }

        if (action === 'accept') {
            friendship.status = 'accepted';
            await friendship.save();
            res.json({ success: true, message: 'Friend request accepted' });
        } else if (action === 'reject') {
            await Friendship.findByIdAndDelete(requestId);
            res.json({ success: true, message: 'Friend request rejected' });
        } else {
            res.status(400).json({ message: 'Invalid action' });
        }
    } catch (error: any) {
        console.error('Error responding to friend request:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get list of friends
// @route   GET /api/friends
// @access  Private
export const getFriends = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;

        const friendships = await Friendship.find({
            $or: [{ requester: userId }, { recipient: userId }],
            status: 'accepted',
        })
            .populate('requester', 'profile.name profile.avatar email')
            .populate('recipient', 'profile.name profile.avatar email');

        const friends = friendships.map((f: any) => {
            const isRequester = f.requester._id.toString() === userId.toString();
            return isRequester ? f.recipient : f.requester;
        });

        res.json({ success: true, friends });
    } catch (error: any) {
        console.error('Error fetching friends:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get pending requests
// @route   GET /api/friends/requests
// @access  Private
export const getFriendRequests = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;

        // Requests received by the user
        const requests = await Friendship.find({
            recipient: userId,
            status: 'pending',
        }).populate('requester', 'profile.name profile.avatar email');

        res.json({ success: true, requests });
    } catch (error: any) {
        console.error('Error fetching friend requests:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Sync contacts to find friends
// @route   POST /api/friends/sync-contacts
// @access  Private
export const syncContacts = async (req: Request, res: Response) => {
    try {
        const { contacts } = req.body; // Array of phone numbers
        const userId = (req as any).user._id;

        if (!contacts || !Array.isArray(contacts)) {
            return res.status(400).json({ message: 'Contacts array is required' });
        }

        // Normalize phone numbers (basic normalization)
        // In a real app, use a library like google-libphonenumber
        const normalizedContacts = contacts.map(c => c.replace(/\D/g, '').slice(-10));

        // Find users with matching phone numbers
        // Using regex to match the last 10 digits to handle country codes roughly
        const matchingUsers = await User.find({
            phone: { $in: normalizedContacts.map(p => new RegExp(p + '$')) },
            _id: { $ne: userId } // Exclude self
        }).select('profile.name profile.avatar email phone');

        // Check friendship status for each match
        const results = await Promise.all(matchingUsers.map(async (user) => {
            const friendship = await Friendship.findOne({
                $or: [
                    { requester: userId, recipient: user._id },
                    { requester: user._id, recipient: userId },
                ]
            });

            let status = 'none';
            if (friendship) {
                status = friendship.status;
            }

            return {
                _id: user._id,
                name: user.profile.name,
                avatar: user.profile.avatar,
                email: user.email,
                phone: user.phone,
                status
            };
        }));

        res.json({ success: true, contacts: results });
    } catch (error: any) {
        console.error('Error syncing contacts:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
