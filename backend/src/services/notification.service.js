"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = void 0;
const Notification_1 = require("../models/Notification");
const socket_1 = require("../config/socket");
const createNotification = async (params) => {
    try {
        const notification = await Notification_1.Notification.create({
            userId: params.userId,
            type: params.type,
            title: params.title,
            message: params.message,
            channel: params.channel || 'in_app',
        });
        // Fire WebSocket event for real-time in-app toast/bell update
        try {
            const io = (0, socket_1.getIO)();
            // We assume users join a room named by their userId when they connect
            io.to(params.userId.toString()).emit('notification:new', notification);
        }
        catch (socketError) {
            console.error('Socket.io error while emitting notification:', socketError);
            // Don't fail the creation just because socket emission failed
        }
        return notification;
    }
    catch (error) {
        console.error('Failed to create notification:', error);
        throw error;
    }
};
exports.createNotification = createNotification;
