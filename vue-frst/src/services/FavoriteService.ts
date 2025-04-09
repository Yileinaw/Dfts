import http from '../http';
import type { Post } from '../types/models';

// Define the expected API response structure for favorites
interface GetFavoritesResponse {
    posts: Post[];
    totalCount: number;
}

export const FavoriteService = {
    /**
     * Get the current user's favorited posts.
     */
    async getMyFavorites(params?: { page?: number; limit?: number }): Promise<GetFavoritesResponse> {
        // Assuming backend route is /api/favorites/my
        // const response = await http.get<GetFavoritesResponse>('/favorites/my', { params }); // Old path
        const response = await http.get<GetFavoritesResponse>('/users/me/favorites', { params }); // New path under /api/users
        return response.data;
    }
}; 