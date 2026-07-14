export declare const calculateAgriCreditScore: (farmerId: string) => Promise<number>;
export declare const updateLoanStatus: (loanId: string, status: 'approved' | 'rejected' | 'disbursed' | 'repaid' | 'defaulted') => Promise<import("mongoose").Document<unknown, {}, import("../models/Loan").ILoan, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Loan").ILoan & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
//# sourceMappingURL=credit.service.d.ts.map