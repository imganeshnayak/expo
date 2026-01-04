import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import MerchantUser, { IMerchantUser } from '../models/business/MerchantUser';

// Extend Express Request interface to include user
declare global {
    namespace Express {
        interface Request {
            user?: IUser & { merchantId?: any };
        }
    }
}

interface DecodedToken {
    id: string;
    iat: number;
    exp: number;
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token - JWT_SECRET must be set in environment
            const jwtSecret = process.env.JWT_SECRET;
            if (!jwtSecret) {
                console.error('CRITICAL: JWT_SECRET environment variable is not set');
                return res.status(500).json({ message: 'Server configuration error' });
            }

            const decoded = jwt.verify(token, jwtSecret) as DecodedToken;

            // Try to find as regular user first
            let user = await User.findById(decoded.id).select('-password');

            if (!user) {
                // Try to find as merchant user
                const merchantUser = await MerchantUser.findById(decoded.id).select('-password');
                if (merchantUser) {
                    // Add merchantId to user object for easy access
                    user = merchantUser as any;
                    (user as any).merchantId = merchantUser.merchantId;
                }
            }

            if (!user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            req.user = user as any;
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

