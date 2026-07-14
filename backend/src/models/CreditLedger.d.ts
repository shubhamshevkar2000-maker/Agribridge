import mongoose, { Document, Types } from 'mongoose';
export interface ICreditLedger extends Document {
    farmerId: Types.ObjectId;
    trustScore: number;
    creditScore: number;
    factors: {
        repaymentHistory: number;
        transactionConsistency: number;
        disputeRate: number;
        incomeStability: number;
    };
    history: {
        date: Date;
        score: number;
    }[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const CreditLedger: mongoose.Model<ICreditLedger, {}, {}, {}, Document<unknown, {}, ICreditLedger, {}, mongoose.DefaultSchemaOptions> & ICreditLedger & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ICreditLedger>;
//# sourceMappingURL=CreditLedger.d.ts.map