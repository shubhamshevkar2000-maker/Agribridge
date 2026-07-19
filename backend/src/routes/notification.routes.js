"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const Notification_1 = require("../models/Notification");
const router = (0, express_1.Router)();
// GET /api/notifications
router.get('/', auth_middleware_1.protect, async (req, res) => {
    try {
        const notifications = await Notification_1.Notification.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50);
        const unreadCount = await Notification_1.Notification.countDocuments({ userId: req.user.id, isRead: false });
        res.json({ success: true, data: { list: notifications, unreadCount } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// PUT /api/notifications/read
router.put('/read', auth_middleware_1.protect, async (req, res) => {
    try {
        await Notification_1.Notification.updateMany({ userId: req.user.id, isRead: false }, { $set: { isRead: true } });
        res.json({ success: true, message: 'Notifications marked as read' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.default = router;
