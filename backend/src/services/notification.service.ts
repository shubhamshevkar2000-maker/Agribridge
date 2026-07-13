import { Types } from 'mongoose';
import { Notification } from '../models/Notification';
import { getIO } from '../config/socket';

export interface CreateNotificationParams {
  userId: string | Types.ObjectId;
  type: string;
  title: string;
  message: string;
  channel?: 'push' | 'sms' | 'email' | 'in_app';
}

export const createNotification = async (params: CreateNotificationParams) => {
  try {
    const notification = await Notification.create({
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      channel: params.channel || 'in_app',
    });

    // Fire WebSocket event for real-time in-app toast/bell update
    try {
      const io = getIO();
      // We assume users join a room named by their userId when they connect
      io.to(params.userId.toString()).emit('notification:new', notification);
    } catch (socketError) {
      console.error('Socket.io error while emitting notification:', socketError);
      // Don't fail the creation just because socket emission failed
    }

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }
};
