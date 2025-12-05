import { Request, Response } from 'express';
import User from '../models/User';
import generateToken from '../utils/jwt';

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !phone || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        // Check if user exists
        const userExists = await User.findOne({ $or: [{ email }, { phone }] });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user
        const user = await User.create({
            email,
            phone,
            password,
            profile: {
                name,
                preferences: {
                    notifications: true,
                    locationServices: false,
                    language: 'en',
                },
            },
        });

        if (user) {
            // Queue Signup XP
            const { queueXP } = require('../services/GamificationService');
            await queueXP(user._id.toString(), 50, 'SIGNUP', 'Welcome Bonus');

            res.status(201).json({
                _id: user._id,
                name: user.profile.name,
                email: user.email,
                phone: user.phone,
                token: generateToken(user._id as any),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.profile.name,
                email: user.email,
                phone: user.phone,
                token: generateToken(user._id as any),
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.user?._id);

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
