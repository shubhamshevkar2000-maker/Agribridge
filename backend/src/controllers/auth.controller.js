"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.updateMe = exports.getMe = exports.login = exports.signup = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const zod_1 = require("zod");
const User_1 = require("../models/User");
const KYC_1 = require("../models/KYC");
const BankDetails_1 = require("../models/BankDetails");
const jwt_1 = require("../utils/jwt");
const cloudinary_1 = require("../config/cloudinary");
const signupSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().optional(),
    password: zod_1.z.string().min(6),
    role: zod_1.z.enum(['farmer', 'buyer', 'logistics', 'bank', 'admin']),
    kycDocument: zod_1.z.string().optional(),
    location: zod_1.z.object({
        coordinates: zod_1.z.array(zod_1.z.number()).length(2).optional(),
        address: zod_1.z.string().optional(),
        city: zod_1.z.string().optional(),
        district: zod_1.z.string().optional(),
        state: zod_1.z.string().optional(),
        zipCode: zod_1.z.string().optional()
    }).optional()
}).refine(data => data.email || data.phone, {
    message: "Either email or phone is required",
});
const loginSchema = zod_1.z.object({
    emailOrPhone: zod_1.z.string(),
    password: zod_1.z.string()
});
const signup = async (req, res) => {
    try {
        const validatedData = signupSchema.parse(req.body);
        // Check if user exists by either email or phone (whichever is provided)
        const queryList = [];
        if (validatedData.email)
            queryList.push({ email: validatedData.email });
        if (validatedData.phone)
            queryList.push({ phone: validatedData.phone });
        if (queryList.length > 0) {
            const userExists = await User_1.User.findOne({ $or: queryList });
            if (userExists) {
                if (validatedData.email && userExists.email === validatedData.email) {
                    return res.status(400).json({ success: false, message: 'Email is already registered' });
                }
                if (validatedData.phone && userExists.phone === validatedData.phone) {
                    return res.status(400).json({ success: false, message: 'Phone number is already registered' });
                }
                return res.status(400).json({ success: false, message: 'User already exists' });
            }
        }
        const salt = await bcrypt_1.default.genSalt(10);
        const passwordHash = await bcrypt_1.default.hash(validatedData.password, salt);
        let kycUrl = '';
        let kycStatusValue = 'not_submitted';
        if (validatedData.kycDocument) {
            try {
                const uploadResult = await (0, cloudinary_1.safeUpload)(validatedData.kycDocument, {
                    folder: 'kyc',
                    resource_type: 'auto',
                });
                kycUrl = uploadResult.secure_url;
                kycStatusValue = 'pending';
                console.log('Cloudinary upload success. URL:', kycUrl);
            }
            catch (uploadError) {
                console.error('Cloudinary upload failed:', uploadError);
                // Fallback: Signup succeeds, but user is left as not_submitted without document
                kycStatusValue = 'not_submitted';
            }
        }
        const user = await User_1.User.create({
            name: validatedData.name,
            email: validatedData.email,
            phone: validatedData.phone,
            passwordHash,
            role: validatedData.role,
            kycStatus: kycStatusValue,
            kycDocument: kycUrl || undefined,
            location: validatedData.location ? {
                type: 'Point',
                coordinates: validatedData.location.coordinates || [0, 0],
                address: validatedData.location.address,
                city: validatedData.location.city,
                district: validatedData.location.district,
                state: validatedData.location.state,
                zipCode: validatedData.location.zipCode
            } : undefined
        });
        if (kycUrl) {
            await KYC_1.KYC.create({
                userId: user._id,
                aadhaarFront: kycUrl,
                status: 'pending'
            });
        }
        const token = (0, jwt_1.generateToken)(user._id.toString(), user.role);
        res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                role: user.role,
                token
            }
        });
    }
    catch (error) {
        console.error('Signup error:', error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ success: false, errors: error.issues });
        }
        res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};
exports.signup = signup;
const login = async (req, res) => {
    try {
        const validatedData = loginSchema.parse(req.body);
        const user = await User_1.User.findOne({
            $or: [
                { email: validatedData.emailOrPhone },
                { phone: validatedData.emailOrPhone }
            ]
        });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt_1.default.compare(validatedData.password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        const token = (0, jwt_1.generateToken)(user._id.toString(), user.role);
        res.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                role: user.role,
                token
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        const userDoc = await User_1.User.findById(req.user.id).select('-passwordHash').lean();
        if (!userDoc) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const kyc = await KYC_1.KYC.findOne({ userId: req.user.id }).lean();
        const bankDetails = await BankDetails_1.BankDetails.findOne({ userId: req.user.id }).lean();
        res.json({
            success: true,
            data: {
                ...userDoc,
                kyc: kyc || { status: 'not_submitted' },
                bankDetails: bankDetails || {}
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getMe = getMe;
const updateMe = async (req, res) => {
    try {
        const { name, email, phone, location, profilePhoto, farmSize, experience, crops, buyerPreferences, notificationSettings, kyc, bankDetails } = req.body;
        const user = await User_1.User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (user.isDemoAccount) {
            if (name !== undefined || email !== undefined || phone !== undefined || kyc !== undefined || bankDetails !== undefined) {
                return res.status(403).json({
                    success: false,
                    message: 'Demo accounts are restricted from modifying profile credentials, KYC, and bank details.'
                });
            }
        }
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (email !== undefined)
            updateData.email = email;
        if (phone !== undefined)
            updateData.phone = phone;
        if (profilePhoto !== undefined)
            updateData.profilePhoto = profilePhoto;
        if (farmSize !== undefined)
            updateData.farmSize = farmSize;
        if (experience !== undefined)
            updateData.experience = experience;
        if (crops !== undefined)
            updateData.crops = crops;
        if (buyerPreferences !== undefined)
            updateData.buyerPreferences = buyerPreferences;
        if (notificationSettings !== undefined)
            updateData.notificationSettings = notificationSettings;
        if (location) {
            updateData.location = {
                type: 'Point',
                coordinates: location.coordinates || [0, 0],
                address: location.address,
                city: location.city,
                district: location.district,
                state: location.state,
                zipCode: location.zipCode
            };
        }
        if (kyc) {
            let kycRecord = await KYC_1.KYC.findOne({ userId: req.user.id });
            if (!kycRecord) {
                kycRecord = new KYC_1.KYC({ userId: req.user.id });
            }
            if (kyc.aadhaarNumber !== undefined)
                kycRecord.aadhaarNumber = kyc.aadhaarNumber;
            if (kyc.aadhaarFront) {
                const uploadResult = await (0, cloudinary_1.safeUpload)(kyc.aadhaarFront, {
                    folder: 'kyc',
                    resource_type: 'auto',
                });
                kycRecord.aadhaarFront = uploadResult.secure_url;
                kycRecord.status = 'pending';
            }
            if (kyc.aadhaarBack) {
                const uploadResult = await (0, cloudinary_1.safeUpload)(kyc.aadhaarBack, {
                    folder: 'kyc',
                    resource_type: 'auto',
                });
                kycRecord.aadhaarBack = uploadResult.secure_url;
                kycRecord.status = 'pending';
            }
            if (kycRecord.aadhaarFront || kycRecord.aadhaarBack || kycRecord.aadhaarNumber) {
                if (kycRecord.status === 'not_submitted') {
                    kycRecord.status = 'pending';
                }
            }
            await kycRecord.save();
            updateData.kycStatus = kycRecord.status;
        }
        if (bankDetails) {
            let bankRecord = await BankDetails_1.BankDetails.findOne({ userId: req.user.id });
            if (!bankRecord) {
                bankRecord = new BankDetails_1.BankDetails({ userId: req.user.id });
            }
            if (bankDetails.accountNumber !== undefined)
                bankRecord.accountNumber = bankDetails.accountNumber;
            if (bankDetails.ifscCode !== undefined)
                bankRecord.ifscCode = bankDetails.ifscCode;
            if (bankDetails.bankName !== undefined)
                bankRecord.bankName = bankDetails.bankName;
            if (bankDetails.accountHolderName !== undefined)
                bankRecord.accountHolderName = bankDetails.accountHolderName;
            await bankRecord.save();
        }
        const updatedUser = await User_1.User.findByIdAndUpdate(req.user.id, updateData, { new: true }).select('-passwordHash').lean();
        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const finalKyc = await KYC_1.KYC.findOne({ userId: req.user.id }).lean();
        const finalBank = await BankDetails_1.BankDetails.findOne({ userId: req.user.id }).lean();
        res.json({
            success: true,
            data: {
                ...updatedUser,
                kyc: finalKyc || { status: 'not_submitted' },
                bankDetails: finalBank || {}
            },
            message: 'Profile updated successfully'
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateMe = updateMe;
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }
        const emailSchema = zod_1.z.string().email();
        const parseResult = emailSchema.safeParse(email);
        if (!parseResult.success) {
            return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
        }
        const user = await User_1.User.findOne({ email });
        if (!user) {
            // Audit log failed attempt (user not found)
            console.log(`[AUDIT] Password reset link requested. Timestamp: ${new Date().toISOString()}, IP: ${req.ip}, User ID: N/A, Status: Failed (User not found)`);
            // Generic response to prevent account enumeration
            return res.json({
                success: true,
                message: 'If an account with this email exists, a password reset link has been sent.'
            });
        }
        // Generate secure reset token
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        // Hash it before storing in the database
        const hashedToken = crypto_1.default.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await user.save();
        // Print reset link to the console in development
        const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3000';
        const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
        console.log(`\n========================================`);
        console.log(`[PASSWORD RESET] Reset URL for ${email}:`);
        console.log(resetUrl);
        console.log(`========================================\n`);
        // Audit log success
        console.log(`[AUDIT] Password reset link requested. Timestamp: ${new Date().toISOString()}, IP: ${req.ip}, User ID: ${user._id}, Status: Success`);
        res.json({
            success: true,
            message: 'If an account with this email exists, a password reset link has been sent.'
        });
    }
    catch (error) {
        console.error('ForgotPassword error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).json({ success: false, message: 'Token and password are required' });
        }
        // Password strength check: Min 8 chars, 1 uppercase, 1 lowercase, 1 number
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long, and contain at least one uppercase letter, one lowercase letter, and one number.'
            });
        }
        // Hash the token sent in body to compare with the database
        const hashedToken = crypto_1.default.createHash('sha256').update(token).digest('hex');
        const user = await User_1.User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: new Date() }
        });
        if (!user) {
            // Audit log failed reset (token invalid/expired)
            console.log(`[AUDIT] Password reset failed. Timestamp: ${new Date().toISOString()}, IP: ${req.ip}, User ID: N/A, Status: Failed (Invalid or expired token)`);
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired password reset token'
            });
        }
        // Hash new password using existing bcrypt mechanism
        const salt = await bcrypt_1.default.genSalt(10);
        const passwordHash = await bcrypt_1.default.hash(password, salt);
        user.passwordHash = passwordHash;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        // Audit log success
        console.log(`[AUDIT] Password reset completed. Timestamp: ${new Date().toISOString()}, IP: ${req.ip}, User ID: ${user._id}, Status: Success`);
        res.json({
            success: true,
            message: 'Password has been reset successfully'
        });
    }
    catch (error) {
        console.error('ResetPassword error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.resetPassword = resetPassword;
