import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/AuthMiddleware';
import { FavoriteService } from '../services/FavoriteService';

export class FavoriteController {

    /**
     * Handle request to favorite a post.
     */
    public static async favoritePost(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const postId = parseInt(req.params.postId, 10);
            const userId = req.userId;

            if (isNaN(postId)) {
                res.status(400).json({ message: 'Invalid post ID' });
                return;
            }
            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            await FavoriteService.favoritePost(userId, postId);
            // Return 204 No Content or 200 OK with a simple message
            res.status(204).send(); 

        } catch (error: any) {
            console.error('Favorite Post Error:', error);
            res.status(500).json({ message: error.message || 'Failed to favorite post' });
        }
    }

    /**
     * Handle request to unfavorite a post.
     */
    public static async unfavoritePost(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const postId = parseInt(req.params.postId, 10);
            const userId = req.userId;

            if (isNaN(postId)) {
                res.status(400).json({ message: 'Invalid post ID' });
                return;
            }
            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            const result = await FavoriteService.unfavoritePost(userId, postId);
            
            if (result === null) {
                // If service returns null, it means the favorite didn't exist
                // Depending on desired behavior, could return 404 or just 204
                res.status(204).send(); // Treat as success (idempotent)
            } else {
                res.status(204).send(); // Success
            }

        } catch (error: any) {
            console.error('Unfavorite Post Error:', error);
            res.status(500).json({ message: error.message || 'Failed to unfavorite post' });
        }
    }

    /**
     * Handle request to get the current user's favorited posts.
     */
    public static async getMyFavorites(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId;
            const page = parseInt(req.query.page as string) || undefined;
            const limit = parseInt(req.query.limit as string) || undefined;

            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            const result = await FavoriteService.fetchUserFavoritesPage(userId, { page, limit });
            res.status(200).json(result);

        } catch (error: any) {
            res.status(500).json({ message: 'Failed to retrieve favorite posts' });
        }
    }
} 