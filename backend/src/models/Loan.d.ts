import mongoose, { Document, Types } from 'mongoose';
export interface ILoan extends Document {
    farmerId: Types.ObjectId;
    bankId: Types.ObjectId;
    amountRequested: number;
    amountApproved?: number;
    tenure: number;
    interestRate?: number;
    status: 'pending' | 'under_review' | 'approved' | 'disbursed' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
}
export declare const Loan: mongoose.Model<ILoan, {}, {}, {}, Document<unknown, {}, ILoan, {}, mongoose.DefaultSchemaOptions> & ILoan & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ILoan>;
//# sourceMappingURL=Loan.d.ts.map