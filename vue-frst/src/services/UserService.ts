import http from '@/http';
import type { User, Post, Notification } from '@/types/models';
import type { PaginatedResponse } from '@/types/api';

// Define the type for the data expected by the update endpoint
interface UpdateProfileData {
  nickname?: string;
  name?: string;
  // Add other updatable fields here if needed
  // e.g., bio?: string;
}

// Define specific response types based on backend controllers
interface UserProfileResponse {
    message?: string;
    user: Omit<User, 'password'>;
}

interface AvatarUploadResponse {
    message: string;
    avatarUrl: string;
    user?: Omit<User, 'password'>; // Backend might return updated user
}

// Define Paginated response types for user-specific data
interface PaginatedFavoritesResponse extends PaginatedResponse {
     // From FavoriteService.getFavoritePostsByUserId response
    posts: (Post & { isLiked?: boolean; isFavorited?: boolean; author?: { id: number, name: string | null } })[];
}

interface PaginatedUserPostsResponse extends PaginatedResponse {
    // From PostService.getAllPosts response
    posts: (Post & { isLiked?: boolean; isFavorited?: boolean; commentsCount?: number; favoritesCount?: number })[]; 
}

// Assume NotificationWithRelations structure from backend NotificationService
interface PaginatedNotificationsResponse extends PaginatedResponse {
  notifications: (Notification & {
      actor?: { id: number; name: string | null };
      post?: { id: number; title: string };
      comment?: { id: number; text: string };
  })[];
}

export class UserService {
  /**
   * Update the current user's profile information.
   */
  async updateProfile(data: UpdateProfileData): Promise<User> {
    // Use PUT request to /users/profile endpoint
    const response = await http.put<User>('/users/profile', data);
    return response.data; // Return the updated user data from the backend
  }

  // 获取当前用户信息
  static async getCurrentUserProfile(): Promise<UserProfileResponse> {
    const response = await http.get<UserProfileResponse>('/users/me');
    return response.data;
  }

  // 更新用户信息 (名字或预设头像)
  static async updateUserProfile(data: { name?: string; avatarUrl?: string | null }): Promise<UserProfileResponse> {
    const response = await http.put<UserProfileResponse>('/users/me/profile', data);
    return response.data;
  }

  // 获取上传头像的 URL
  static getUploadAvatarUrl(): string {
    // Ensure http.defaults.baseURL is correctly configured in your http instance setup
    const baseUrl = http.defaults.baseURL || ''; 
    return `${baseUrl.replace(/\/$/, '')}/users/me/avatar`;
  }
  
  // --- 添加获取收藏、帖子、通知的服务方法 ---
  static async getFavorites(page: number = 1, limit: number = 10): Promise<PaginatedFavoritesResponse> {
    const response = await http.get<PaginatedFavoritesResponse>('/users/me/favorites', {
      params: { page, limit }
    });
    return response.data;
  }

  static async getMyPosts(page: number = 1, limit: number = 10): Promise<PaginatedUserPostsResponse> {
    const response = await http.get<PaginatedUserPostsResponse>('/users/me/posts', {
      params: { page, limit }
    });
    return response.data;
  }

  static async getNotifications(page: number = 1, limit: number = 10): Promise<PaginatedNotificationsResponse> {
    const response = await http.get<PaginatedNotificationsResponse>('/users/me/notifications', {
      params: { page, limit }
    });
    return response.data;
  }
  // --- 结束 --- 
} 