import mongoose, { Document, Types } from 'mongoose';
export interface IVehicle extends Document {
    logisticsPartnerId: Types.ObjectId;
    type: string;
    capacity: number;
    registrationNumber: string;
    insuranceDoc: string;
    verified: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Vehicle: mongoose.Model<IVehicle, {}, {}, {}, Document<unknown, {}, IVehicle, {}, mongoose.DefaultSchemaOptions> & IVehicle & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IVehicle>;
//# sourceMappingURL=Vehicle.d.ts.map