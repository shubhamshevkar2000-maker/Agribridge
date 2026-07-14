export declare const updateDeliveryStatus: (deliveryId: string, status: 'pending' | 'in_transit' | 'delivered', currentLocation?: {
    lat: number;
    lng: number;
}) => Promise<import("mongoose").Document<unknown, {}, import("../models/Delivery").IDelivery, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Delivery").IDelivery & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const optimizeRoute: (waypoints: {
    lat: number;
    lng: number;
}[]) => {
    lat: number;
    lng: number;
}[];
//# sourceMappingURL=logistics.service.d.ts.map