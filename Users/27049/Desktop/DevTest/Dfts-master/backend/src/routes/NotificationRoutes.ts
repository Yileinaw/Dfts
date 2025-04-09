import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController';
import { AuthMiddleware } from '../middleware/AuthMiddleware';

const router = Router();

// All notification routes require authentication
router.use(AuthMiddleware);

// GET /api/notifications - Get current user's notifications
router.get('/', NotificationController.getNotifications);

// PATCH /api/notifications/read-all - Mark all as read
router.patch('/read-all', NotificationController.markAllAsRead);

// PATCH /api/notifications/:id/read - Mark a specific notification as read
router.patch('/:id/read', NotificationController.markAsRead);

// DELETE /api/notifications/clear-all - Delete all notifications
router.delete('/clear-all', NotificationController.clearAllNotifications);

// DELETE /api/notifications/:id - Delete a specific notification
router.delete('/:id', NotificationController.deleteNotification);

export default router; 