// backend/src/controllers/CommentController.ts
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/AuthMiddleware';
import { CommentService } from '../services/CommentService';

export class CommentController {

    public static async createComment(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const postId = parseInt(req.params.postId, 10);
            const userId = req.userId;
            const { text } = req.body; // Get comment text from request body

            if (isNaN(postId)) {
                res.status(400).json({ message: 'Invalid post ID' });
                return;
            }
            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            if (!text) {
                res.status(400).json({ message: 'Comment text is required' });
                return;
            }

            const newComment = await CommentService.createComment(userId, postId, text);
            res.status(201).json({ message: 'Comment created successfully', comment: newComment });

        } catch (error: any) {
            console.error('Create Comment Error:', error);
            res.status(500).json({ message: error.message || 'Failed to create comment' });
        }
    }

    public static async getCommentsByPostId(req: Request, res: Response): Promise<void> {
        try {
            const postId = parseInt(req.params.postId, 10);
            const page = parseInt(req.query.page as string) || undefined;
            const limit = parseInt(req.query.limit as string) || undefined;

            if (isNaN(postId)) {
                res.status(400).json({ message: 'Invalid post ID' });
                return;
            }

            const result = await CommentService.getCommentsByPostId(postId, { page, limit });
            res.status(200).json(result); // Returns { comments: [], totalCount: number }

        } catch (error: any) {
            console.error('Get Comments Error:', error);
            res.status(500).json({ message: error.message || 'Failed to retrieve comments' });
        }
    }

    public static async deleteComment(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const commentId = parseInt(req.params.commentId, 10);
            const userId = req.userId;

            if (isNaN(commentId)) {
                res.status(400).json({ message: 'Invalid comment ID' });
                return;
            }
            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            await CommentService.deleteComment(userId, commentId);
            res.status(204).send(); // No Content on successful deletion

        } catch (error: any) {
            console.error('Delete Comment Error:', error);
            // Handle specific errors like 'Comment not found' or 'Unauthorized'
            if (error.message === 'Comment not found') {
                res.status(404).json({ message: error.message });
            } else if (error.message === 'Unauthorized to delete this comment') {
                res.status(403).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'Failed to delete comment' });
            }
        }
    }
} 