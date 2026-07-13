import mongoose, { Schema, Document, Types } from 'mongoose';

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

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    channel: {
      type: String,
      enum: ['push', 'sms', 'email', 'in_app'],
      default: 'in_app',
    },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1 });
notificationSchema.index({ isRead: 1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
