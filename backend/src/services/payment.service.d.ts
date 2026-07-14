export declare const createRazorpayOrderMock: (orderId: string, amount: number) => Promise<{
    id: string;
    entity: string;
    amount: number;
    currency: string;
    receipt: string;
    status: string;
}>;
export declare const processPaymentMock: (rzpOrderId: string, rzpPaymentId: string, rzpSignature: string, userId: string, amount: number, relatedOrderId?: string, relatedAuctionId?: string) => Promise<never>;
//# sourceMappingURL=payment.service.d.ts.map