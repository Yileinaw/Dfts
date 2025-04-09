import prisma from '../db';
import { Notification, Prisma } from '@prisma/client';

// Define the structure for the response, including related data
interface NotificationWithRelations extends Notification {
  actor: { id: number; name: string | null }; // Include actor's name
  post: { id: number; title: string };       // Include post's title
  comment?: { id: number; text: string };    // Include comment text if applicable
}

interface PaginatedNotificationsResponse {
  notifications: NotificationWithRelations[];
  totalCount: number;
  unreadCount?: number; // Optional: Add unread count later if needed
}

export class NotificationService {

  /**
   * Get notifications for a specific user (recipient) with pagination.
   */
  public static async getNotifications(
    recipientId: number,
    options: { page?: number; limit?: number; unreadOnly?: boolean } = {}
  ): Promise<PaginatedNotificationsResponse> {
    const { page = 1, limit = 10, unreadOnly = false } = options;
    const skip = (page - 1) * limit;

    const whereClause: Prisma.NotificationWhereInput = {
      recipientId: recipientId,
    };
    if (unreadOnly) {
      whereClause.read = false;
    }

    const [notificationsData, totalCount] = await prisma.$transaction([
      prisma.notification.findMany({
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
      prisma.notification.count({ where: whereClause })
    ]);

    // Cast to the extended type (assuming includes are always present as requested)
    const notifications = notificationsData as NotificationWithRelations[];

    return { notifications, totalCount };
  }

  /**
   * Mark a specific notification as read.
   */
  public static async markAsRead(recipientId: number, notificationId: number): Promise<Notification | null> {
    // Ensure the notification belongs to the user trying to mark it
    const updatedNotification = await prisma.notification.updateMany({
        where: {
            id: notificationId,
            recipientId: recipientId,
            read: false // Only update if it's currently unread
        },
        data: { read: true }
    });
    
     if (updatedNotification.count > 0) {
         return prisma.notification.findUnique({ where: { id: notificationId } });
     } else {
        return null;
     }
  }

  /**
   * Mark all notifications for a user as read.
   */
  public static async markAllAsRead(recipientId: number): Promise<{ count: number }> {
    const result = await prisma.notification.updateMany({
      where: {
        recipientId: recipientId,
        read: false,
      },
      data: { read: true },
    });
    return result; 
  }

  /**
   * Delete a specific notification.
   */
  public static async deleteNotification(recipientId: number, notificationId: number): Promise<Notification | null> {
    const notificationToDelete = await prisma.notification.findFirst({
        where: { 
            id: notificationId,
            recipientId: recipientId // Verify ownership directly in query
         }
    });

    if (!notificationToDelete) {
        return null; 
    }

    await prisma.notification.delete({ where: { id: notificationId } });

    return notificationToDelete; 
  }

   /**
   * Delete all notifications for a user.
   */
  public static async clearAllNotifications(recipientId: number): Promise<{ count: number }> {
    const result = await prisma.notification.deleteMany({
      where: { recipientId: recipientId },
    });
    return result; 
  }
} 