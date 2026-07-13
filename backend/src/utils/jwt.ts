import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

export const generateToken = (userId: Types.ObjectId | string, role: string) => {
  return jwt.sign(
    { id: userId.toString(), role },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '7d' }
  );
};
