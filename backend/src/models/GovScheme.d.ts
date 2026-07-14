import mongoose, { Document } from 'mongoose';
export interface IGovScheme extends Document {
    name: string;
    eligibilityCriteria: string;
    description: string;
    applyLink: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const GovScheme: mongoose.Model<IGovScheme, {}, {}, {}, Document<unknown, {}, IGovScheme, {}, mongoose.DefaultSchemaOptions> & IGovScheme & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IGovScheme>;
//# sourceMappingURL=GovScheme.d.ts.map