import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

const generateToken = (id: Types.ObjectId): string => {
    const secret = process.env.JWT_SECRET || 'secret';
    return jwt.sign({ id: id.toString() }, secret, {
        expiresIn: process.env.JWT_EXPIRE || '30d',
    } as jwt.SignOptions);
};

export default generateToken;
