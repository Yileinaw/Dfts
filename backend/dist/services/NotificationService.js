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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const db_1 = __importDefault(require("../db"));
class NotificationService {
    /**
     * Get notifications for a specific user (recipient) with pagination.
     */
    static getNotifications(recipientId_1) {
        return __awaiter(this, arguments, void 0, function* (recipientId, options = {}) {
            const { page = 1, limit = 10, unreadOnly = false } = options;
            const skip = (page - 1) * limit;
            const whereClause = {
                recipientId: recipientId,
            };
            if (unreadOnly) {
                whereClause.read = false;
            }
            const [notificationsData, totalCount] = yield db_1.default.$transaction([
                db_1.default.notification.findMany({
                    where: whereClause,
                    skip: skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        actor: { select: { id: true, name: true, avatarUrl: true } },
                        post: { select: { id: true, title: true } },
                        comment: { select: { id: true, text: true } } // Include comment if present
                    }
                }),
                db_1.default.notification.count({ where: whereClause })
            ]);
            // Cast to the extended type (assuming includes are always present as requested)
            const notifications = notificationsData;
            return { notifications, totalCount };
        });
    }
    /**
     * Mark a specific notification as read.
     */
    static markAsRead(recipientId, notificationId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Ensure the notification belongs to the user trying to mark it
            const updatedNotification = yield db_1.default.notification.updateMany({
                where: {
                    id: notificationId,
                    recipientId: recipientId,
                    read: false // Only update if it's currently unread
                },
                data: { read: true }
            });
            if (updatedNotification.count > 0) {
                return db_1.default.notification.findUnique({ where: { id: notificationId } });
            }
            else {
                return null;
            }
        });
    }
    /**
     * Mark all notifications for a user as read.
     */
    static markAllAsRead(recipientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.default.notification.updateMany({
                where: {
                    recipientId: recipientId,
                    read: false,
                },
                data: { read: true },
            });
            return result;
        });
    }
    /**
     * Delete a specific notification.
     */
    static deleteNotification(recipientId, notificationId) {
        return __awaiter(this, void 0, void 0, function* () {
            const notificationToDelete = yield db_1.default.notification.findFirst({
                where: {
                    id: notificationId,
                    recipientId: recipientId // Verify ownership directly in query
                }
            });
            if (!notificationToDelete) {
                return null;
            }
            yield db_1.default.notification.delete({ where: { id: notificationId } });
            return notificationToDelete;
        });
    }
    /**
    * Delete all notifications for a user.
    */
    static clearAllNotifications(recipientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.default.notification.deleteMany({
                where: { recipientId: recipientId },
            });
            return result;
        });
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=NotificationService.js.map