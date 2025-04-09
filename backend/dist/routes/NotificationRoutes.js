"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const NotificationController_1 = require("../controllers/NotificationController");
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const router = (0, express_1.Router)();
// All notification routes require authentication
router.use(AuthMiddleware_1.AuthMiddleware);
// GET /api/notifications - Get current user's notifications
router.get('/', NotificationController_1.NotificationController.getNotifications);
// PATCH /api/notifications/read-all - Mark all as read
router.patch('/read-all', NotificationController_1.NotificationController.markAllAsRead);
// PATCH /api/notifications/:id/read - Mark a specific notification as read
router.patch('/:id/read', NotificationController_1.NotificationController.markAsRead);
// DELETE /api/notifications/clear-all - Delete all notifications
router.delete('/clear-all', NotificationController_1.NotificationController.clearAllNotifications);
// DELETE /api/notifications/:id - Delete a specific notification
router.delete('/:id', NotificationController_1.NotificationController.deleteNotification);
exports.default = router;
//# sourceMappingURL=NotificationRoutes.js.map