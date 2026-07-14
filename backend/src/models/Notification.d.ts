import mongoose, { Document, Types } from 'mongoose';
export interface INotification extends Document {
    userId: Types.ObjectId;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    channel: 'push' | 'sms' | 'email' | 'in_app';
    createdAt: Date;
    updatedAt: Date;
}
export declare const Notification: mongoose.Model<INotification, {}, {}, {}, Document<unknown, {}, INotification, {}, mongoose.DefaultSchemaOptions> & INotification & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, INotification>;
//# sourceMappingURL=Notification.d.ts.map