import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    name: string;
    email?: string;
    phone?: string;
    passwordHash: string;
    role: 'farmer' | 'buyer' | 'logistics' | 'bank' | 'admin';
    kycStatus: 'pending' | 'verified' | 'rejected' | 'not_submitted';
    profileCompletion: number;
    languages: string[];
    location?: {
        type: string;
        coordinates: number[];
    };
    trustScore?: number;
    creditScore?: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUser>;
//# sourceMappingURL=User.d.ts.map