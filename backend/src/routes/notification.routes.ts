import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import { Notification } from '../models/Notification';

const router = Router();

// GET /api/notifications
router.get('/', protect, async (req: any, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    const unreadCount = await Notification.countDocuments({ userId: req.user.id, isRead: false });

    res.json({ success: true, data: { list: notifications, unreadCount } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/notifications/read
router.put('/read', protect, async (req: any, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ success: true, message: 'Notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
