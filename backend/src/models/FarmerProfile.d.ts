import mongoose, { Document, Types } from 'mongoose';
export interface IFarmerProfile extends Document {
    userId: Types.ObjectId;
    farmName: string;
    farmSize: number;
    primaryCrops: string[];
    bankAccountDetails: {
        accountNumber: string;
        ifscCode: string;
        bankName: string;
        accountHolderName: string;
    };
    documents: {
        type: string;
        url: string;
    }[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const FarmerProfile: mongoose.Model<IFarmerProfile, {}, {}, {}, Document<unknown, {}, IFarmerProfile, {}, mongoose.DefaultSchemaOptions> & IFarmerProfile & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IFarmerProfile>;
//# sourceMappingURL=FarmerProfile.d.ts.map