import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import MerchantUser from '../../models/business/MerchantUser';
import Merchant from '../../models/Merchant';

// Generate JWT Token
const generateToken = (id: string): string => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: process.env.JWT_EXPIRE || '30d',
    } as jwt.SignOptions);
};

// @desc    Register merchant user
// @route   POST /api/merchant/auth/register
// @access  Public
export const registerMerchant = async (req: Request, res: Response) => {
    try {
        const { email, password, businessName, name, phone } = req.body;

        // Check if user exists
        const existingUser = await MerchantUser.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create merchant first
        const merchant = await Merchant.create({
            name: businessName,
            contact: { email, phone },
            isVerified: false,
            isActive: true,
        });

        // Create merchant user
        const merchantUser = await MerchantUser.create({
            merchantId: merchant._id,
            email,
            password,
            role: 'owner',
            profile: { name, phone },
            permissions: ['all'],
        });

        const token = generateToken(merchantUser._id.toString());

        res.status(201).json({
            success: true,
            token,
            user: {
                id: merchantUser._id,
                email: merchantUser.email,
                name: merchantUser.profile.name,
                role: merchantUser.role,
                merchantId: merchant._id,
                businessName: merchant.name,
            },
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Login merchant user
// @route   POST /api/merchant/auth/login
// @access  Public
export const loginMerchant = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Find user with password
        const merchantUser = await MerchantUser.findOne({ email }).select('+password').populate('merchantId');

        if (!merchantUser) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await merchantUser.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Update last login
        merchantUser.lastLogin = new Date();
        await merchantUser.save();

        const token = generateToken(merchantUser._id.toString());

        const merchant = merchantUser.merchantId as any;

        if (!merchant) {
            return res.status(500).json({ message: 'Merchant data not found. Please contact support.' });
        }

        res.json({
            success: true,
            token,
            user: {
                id: merchantUser._id,
                email: merchantUser.email,
                name: merchantUser.profile.name,
                role: merchantUser.role,
                merchantId: merchant._id,
                businessName: merchant.name,
                settings: merchantUser.settings,
            },
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get merchant profile
// @route   GET /api/merchant/auth/profile
// @access  Private
export const getMerchantProfile = async (req: Request, res: Response) => {
    try {
        const merchantUser = await MerchantUser.findById(req.user?._id).populate('merchantId');

        if (!merchantUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const merchant = merchantUser.merchantId as any;

        res.json({
            success: true,
            user: {
                id: merchantUser._id,
                email: merchantUser.email,
                profile: merchantUser.profile,
                role: merchantUser.role,
                settings: merchantUser.settings,
                merchantId: merchant._id,
                merchant: {
                    name: merchant.name,
                    description: merchant.description,
                    category: merchant.category,
                    logo: merchant.logo,
                    contact: merchant.contact,
                    location: merchant.location,
                    rating: merchant.rating,
                },
            },
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update merchant profile
// @route   PUT /api/merchant/auth/profile
// @access  Private
export const updateMerchantProfile = async (req: Request, res: Response) => {
    try {
        const merchantUser = await MerchantUser.findById(req.user?._id);

        if (!merchantUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user profile
        if (req.body.name) merchantUser.profile.name = req.body.name;
        if (req.body.phone) merchantUser.profile.phone = req.body.phone;
        if (req.body.avatar) merchantUser.profile.avatar = req.body.avatar;

        await merchantUser.save();

        // Update merchant business details
        if (merchantUser.merchantId) {
            const merchant = await Merchant.findById(merchantUser.merchantId);
            if (merchant) {
                if (req.body.businessName) merchant.name = req.body.businessName;
                if (req.body.address) merchant.location.address = req.body.address;
                if (req.body.businessType) merchant.category = [req.body.businessType];
                if (req.body.businessHours) merchant.businessHours = req.body.businessHours;
                if (req.body.paymentMethods) merchant.paymentMethods = req.body.paymentMethods;
                if (req.body.logo) merchant.logo = req.body.logo;

                await merchant.save();
            }
        }

        // Fetch updated user with merchant details
        const updatedUser = await MerchantUser.findById(req.user?._id).populate('merchantId');
        const merchant = updatedUser?.merchantId as any;

        res.json({
            success: true,
            user: {
                id: updatedUser?._id,
                email: updatedUser?.email,
                profile: updatedUser?.profile,
                role: updatedUser?.role,
                settings: updatedUser?.settings,
                merchantId: merchant._id,
                businessName: merchant.name,
                businessType: merchant.category?.[0],
                address: merchant.location?.address,
                businessHours: merchant.businessHours,
                paymentMethods: merchant.paymentMethods,
                merchant: {
                    name: merchant.name,
                    description: merchant.description,
                    category: merchant.category,
                    logo: merchant.logo,
                    contact: merchant.contact,
                    location: merchant.location,
                    rating: merchant.rating,
                    businessHours: merchant.businessHours,
                    paymentMethods: merchant.paymentMethods,
                },
            },
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update merchant settings
// @route   PUT /api/merchant/auth/settings
// @access  Private
export const updateMerchantSettings = async (req: Request, res: Response) => {
    try {
        const merchantUser = await MerchantUser.findById(req.user?._id);

        if (!merchantUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update settings
        merchantUser.settings = { ...merchantUser.settings, ...req.body };
        await merchantUser.save();

        res.json({
            success: true,
            settings: merchantUser.settings,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
