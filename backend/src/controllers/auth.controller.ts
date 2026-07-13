import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { User } from '../models/User';
import { generateToken } from '../utils/jwt';

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string().min(6),
  role: z.enum(['farmer', 'buyer', 'logistics', 'bank', 'admin'])
}).refine(data => data.email || data.phone, {
  message: "Either email or phone is required",
});

const loginSchema = z.object({
  emailOrPhone: z.string(),
  password: z.string()
});

export const signup = async (req: Request, res: Response) => {
  try {
    const validatedData = signupSchema.parse(req.body);
    
    // Check if user exists
    const query = validatedData.email 
      ? { email: validatedData.email } 
      : { phone: validatedData.phone };
      
    const userExists = await User.findOne(query);
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validatedData.password, salt);

    const user = await User.create({
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone,
      passwordHash,
      role: validatedData.role,
    });

    const token = generateToken(user._id as string, user.role);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        role: user.role,
        token
      }
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    
    const user = await User.findOne({
      $or: [
        { email: validatedData.emailOrPhone },
        { phone: validatedData.emailOrPhone }
      ]
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(validatedData.password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id as string, user.role);

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        role: user.role,
        token
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
