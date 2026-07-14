import mongoose, { Document, Types } from 'mongoose';
export interface ICrop extends Document {
    farmerId: Types.ObjectId;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
    isOrganic: boolean;
    images: string[];
    qualityGrade?: string;
    harvestDate?: Date;
    status: 'listed' | 'in_auction' | 'sold' | 'expired';
    location?: {
        type: string;
        coordinates: number[];
    };
    createdAt: Date;
    updatedAt: Date;
}
export declare const Crop: mongoose.Model<ICrop, {}, {}, {}, Document<unknown, {}, ICrop, {}, mongoose.DefaultSchemaOptions> & ICrop & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ICrop>;
//# sourceMappingURL=Crop.d.ts.map