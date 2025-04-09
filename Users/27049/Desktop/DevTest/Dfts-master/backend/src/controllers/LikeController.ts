// backend/src/controllers/LikeController.ts
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/AuthMiddleware';
import { LikeService } from '../services/LikeService';

export class LikeController {
    public static async likePost(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const postId = parseInt(req.params.postId, 10); // Get postId from route params
            const userId = req.userId;

            if (isNaN(postId)) {
                res.status(400).json({ message: 'Invalid post ID' });
                return;
            }
            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            await LikeService.likePost(userId, postId);
            res.status(204).send(); // 204 No Content is suitable for successful like/unlike

        } catch (error: any) {
            // Handle specific errors if needed (e.g., 'Post already liked')
            console.error('Like Post Error:', error);
            res.status(500).json({ message: error.message || 'Failed to like post' });
        }
    }

    public static async unlikePost(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const postId = parseInt(req.params.postId, 10); // Get postId from route params
            const userId = req.userId;

            if (isNaN(postId)) {
                res.status(400).json({ message: 'Invalid post ID' });
                return;
            }
            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            await LikeService.unlikePost(userId, postId);
            res.status(204).send(); // 204 No Content

        } catch (error: any) {
            console.error('Unlike Post Error:', error);
            res.status(500).json({ message: error.message || 'Failed to unlike post' });
        }
    }
} 