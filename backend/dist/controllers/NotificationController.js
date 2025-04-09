"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const NotificationService_1 = require("../services/NotificationService");
class NotificationController {
    // GET /api/notifications - Get current user's notifications
    static getNotifications(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const recipientId = req.userId;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const unreadOnly = req.query.unreadOnly === 'true';
                if (!recipientId) {
                    res.status(401).json({ message: 'Unauthorized' });
                    return;
                }
                const result = yield NotificationService_1.NotificationService.getNotifications(recipientId, { page, limit, unreadOnly });
                res.status(200).json(result);
            }
            catch (error) {
                console.error('Get Notifications Error:', error);
                res.status(500).json({ message: 'Failed to retrieve notifications' });
            }
        });
    }
    // PATCH /api/notifications/:id/read - Mark a notification as read
    static markAsRead(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const result = yield NotificationService_1.NotificationService.markAsRead(recipientId, notificationId);
                if (!result) {
                    // Handle cases where notification not found, not owned, or already read
                    res.status(404).json({ message: 'Notification not found or already marked as read' });
                    return;
                }
                res.status(200).json({ message: 'Notification marked as read', notification: result });
            }
            catch (error) {
                console.error('Mark Notification As Read Error:', error);
                res.status(500).json({ message: 'Failed to mark notification as read' });
            }
        });
    }
    // PATCH /api/notifications/read-all - Mark all notifications as read
    static markAllAsRead(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const recipientId = req.userId;
                if (!recipientId) {
                    res.status(401).json({ message: 'Unauthorized' });
                    return;
                }
                const result = yield NotificationService_1.NotificationService.markAllAsRead(recipientId);
                res.status(200).json({ message: `Marked ${result.count} notifications as read` });
            }
            catch (error) {
                console.error('Mark All Notifications As Read Error:', error);
                res.status(500).json({ message: 'Failed to mark all notifications as read' });
            }
        });
    }
    // DELETE /api/notifications/:id - Delete a notification
    static deleteNotification(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const deletedNotification = yield NotificationService_1.NotificationService.deleteNotification(recipientId, notificationId);
                if (!deletedNotification) {
                    res.status(404).json({ message: 'Notification not found or you do not have permission to delete it' });
                    return;
                }
                res.status(200).json({ message: 'Notification deleted successfully', notification: deletedNotification });
                // Or return 204 No Content
                // res.status(204).send();
            }
            catch (error) {
                console.error('Delete Notification Error:', error);
                res.status(500).json({ message: 'Failed to delete notification' });
            }
        });
    }
    // DELETE /api/notifications/clear-all - Delete all notifications
    static clearAllNotifications(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const recipientId = req.userId;
                if (!recipientId) {
                    res.status(401).json({ message: 'Unauthorized' });
                    return;
                }
                const result = yield NotificationService_1.NotificationService.clearAllNotifications(recipientId);
                res.status(200).json({ message: `Deleted ${result.count} notifications` });
            }
            catch (error) {
                console.error('Clear All Notifications Error:', error);
                res.status(500).json({ message: 'Failed to clear notifications' });
            }
        });
    }
}
exports.NotificationController = NotificationController;
//# sourceMappingURL=NotificationController.js.map