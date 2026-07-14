import { Types } from 'mongoose';
export interface CreateNotificationParams {
    userId: string | Types.ObjectId;
    type: string;
    title: string;
    message: string;
    channel?: 'push' | 'sms' | 'email' | 'in_app';
}
export declare const createNotification: (params: CreateNotificationParams) => Promise<import("mongoose").Document<unknown, {}, import("../models/Notification").INotification, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Notification").INotification & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
//# sourceMappingURL=notification.service.d.ts.map