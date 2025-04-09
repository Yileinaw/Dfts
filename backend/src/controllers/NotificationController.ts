import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/AuthMiddleware';
import { NotificationService } from '../services/NotificationService';

export class NotificationController {

    // GET /api/notifications - Get current user's notifications
    public static async getNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const recipientId = req.userId;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const unreadOnly = req.query.unreadOnly === 'true';

            if (!recipientId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            const result = await NotificationService.getNotifications(recipientId, { page, limit, unreadOnly });
            res.status(200).json(result);

        } catch (error: any) {
            console.error('Get Notifications Error:', error);
            res.status(500).json({ message: 'Failed to retrieve notifications' });
        }
    }

    // PATCH /api/notifications/:id/read - Mark a notification as read
    public static async markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const recipientId = req.userId;
            const notificationId = parseInt(req.params.id, 10);

            if (!recipientId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            if (isNaN(notificationId)) {
                res.status(400).json({ message: 'Invalid notification ID' });
                return;
            }

            const result = await NotificationService.markAsRead(recipientId, notificationId);
            if (!result) {
                // Handle cases where notification not found, not owned, or already read
                res.status(404).json({ message: 'Notification not found or already marked as read' }); 
                return;
            }
            res.status(200).json({ message: 'Notification marked as read', notification: result });

        } catch (error: any) {
            console.error('Mark Notification As Read Error:', error);
            res.status(500).json({ message: 'Failed to mark notification as read' });
        }
    }

    // PATCH /api/notifications/read-all - Mark all notifications as read
    public static async markAllAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const recipientId = req.userId;

            if (!recipientId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            const result = await NotificationService.markAllAsRead(recipientId);
            res.status(200).json({ message: `Marked ${result.count} notifications as read` });

        } catch (error: any) {
            console.error('Mark All Notifications As Read Error:', error);
            res.status(500).json({ message: 'Failed to mark all notifications as read' });
        }
    }

    // DELETE /api/notifications/:id - Delete a notification
    public static async deleteNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const recipientId = req.userId;
            const notificationId = parseInt(req.params.id, 10);

            if (!recipientId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
             if (isNaN(notificationId)) {
                res.status(400).json({ message: 'Invalid notification ID' });
                return;
            }

            const deletedNotification = await NotificationService.deleteNotification(recipientId, notificationId);
            if (!deletedNotification) {
                res.status(404).json({ message: 'Notification not found or you do not have permission to delete it' });
                return;
            }
            res.status(200).json({ message: 'Notification deleted successfully', notification: deletedNotification });
            // Or return 204 No Content
            // res.status(204).send();

        } catch (error: any) {
            console.error('Delete Notification Error:', error);
            res.status(500).json({ message: 'Failed to delete notification' });
        }
    }

    // DELETE /api/notifications/clear-all - Delete all notifications
    public static async clearAllNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const recipientId = req.userId;

            if (!recipientId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            const result = await NotificationService.clearAllNotifications(recipientId);
            res.status(200).json({ message: `Deleted ${result.count} notifications` });

        } catch (error: any) {
            console.error('Clear All Notifications Error:', error);
            res.status(500).json({ message: 'Failed to clear notifications' });
        }
    }
} 