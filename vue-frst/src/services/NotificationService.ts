import http from '../http';
import type { Notification } from '../types/models'; // Assuming Notification type is in models.ts

// --- Recreate types from backend service for frontend use ---
// Ideally, these could be shared types if using a monorepo or similar structure
export enum NotificationType {
  LIKE = 'LIKE',
  COMMENT = 'COMMENT',
  FAVORITE = 'FAVORITE'
}

export interface NotificationWithRelations extends Notification {
  actor: { 
    id: number; 
    name: string | null; 
    avatarUrl: string | null;
  }; 
  post: { id: number; title: string };       
  comment?: { id: number; text: string };    
}

export interface PaginatedNotificationsResponse {
  notifications: NotificationWithRelations[];
  totalCount: number;
  unreadCount?: number;
}
// --- End recreate types ---

export const NotificationService = {

  /**
   * Get notifications for the current user.
   */
  async getNotifications(params?: { page?: number; limit?: number; unreadOnly?: boolean }): Promise<PaginatedNotificationsResponse> {
    const response = await http.get<PaginatedNotificationsResponse>('/notifications', { params });
    return response.data;
  },

  /**
   * Mark a specific notification as read.
   */
  async markAsRead(notificationId: number): Promise<{ notification: Notification } | null> {
    const response = await http.patch<{ notification: Notification }>(`/notifications/${notificationId}/read`);
    return response.data;
  },

  /**
   * Mark all notifications for the current user as read.
   */
  async markAllAsRead(): Promise<{ count: number }> {
    const response = await http.patch<{ count: number }>('/notifications/read-all');
    return response.data;
  },

  /**
   * Delete a specific notification.
   */
  async deleteNotification(notificationId: number): Promise<void> { // Changed: Often DELETE returns 204 No Content
    await http.delete(`/notifications/${notificationId}`);
    // No need to return data usually, caller handles UI update
  },

   /**
   * Delete all notifications for the current user.
   */
  async clearAllNotifications(): Promise<{ count: number }> {
     const response = await http.delete<{ count: number }>('/notifications/clear-all');
     return response.data;
  }
}; 