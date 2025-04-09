// backend/src/controllers/CommentController.ts
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/AuthMiddleware';
import { PostService } from '../services/PostService';
import { Prisma } from '@prisma/client';

export class CommentController {

    public static async createComment(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const postId = parseInt(req.params.postId, 10);
            const userId = req.userId;
            const { text, parentId } = req.body;

            if (isNaN(postId)) {
                res.status(400).json({ message: 'Invalid post ID' });
                return;
            }
            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            if (!text || typeof text !== 'string' || text.trim() === '') {
                res.status(400).json({ message: 'Comment text is required and must be a non-empty string' });
                return;
            }
            if (parentId !== undefined && (typeof parentId !== 'number' || !Number.isInteger(parentId))) {
                res.status(400).json({ message: 'Invalid parent comment ID' });
                return;
            }

            const newComment = await PostService.createComment(postId, {
                text: text.trim(),
                authorId: userId,
                parentId: parentId
            });

            res.status(201).json({ message: 'Comment created successfully', comment: newComment });

        } catch (error: any) {
            console.error('[CommentController.createComment] Error:', error);
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                res.status(404).json({ message: 'Post not found or related resource missing' });
            } else {
            res.status(500).json({ message: error.message || 'Failed to create comment' });
            }
        }
    }

    public static async getCommentsByPostId(req: Request, res: Response): Promise<void> {
        try {
            const postId = parseInt(req.params.postId, 10);

            if (isNaN(postId)) {
                res.status(400).json({ message: 'Invalid post ID' });
                return;
            }

            const comments = await PostService.getCommentsByPostId(postId);
            
            res.status(200).json(comments);

        } catch (error: any) {
            console.error('[CommentController.getCommentsByPostId] Error:', error);
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

            const deletedComment = await PostService.deleteComment(commentId, userId);
            
            if (!deletedComment) {
                // This case is handled by PostService throwing an error or returning null if not found
                // The catch block will handle it. We might refine this.
                // For now, assume success if no error is thrown.
            }
            
            res.status(204).send();

        } catch (error: any) {
            console.error('[CommentController.deleteComment] Error:', error);
            if (error.message.includes('Forbidden')) {
                res.status(403).json({ message: error.message });
            } else if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                res.status(404).json({ message: 'Comment not found' });
            } else {
                res.status(500).json({ message: error.message || 'Failed to delete comment' });
            }
        }
    }
} 