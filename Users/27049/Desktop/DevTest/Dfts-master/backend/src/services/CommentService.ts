// backend/src/services/CommentService.ts
import prisma from '../db';
import { Comment, Post, Prisma } from '@prisma/client';

interface PaginatedCommentsResponse {
    comments: (Comment & { author: { id: number, name: string | null } })[]; // Include author name
    totalCount: number;
}

export class CommentService {

    /**
     * Create a new comment for a post.
     */
    public static async createComment(userId: number, postId: number, text: string): Promise<Comment> {
        if (!text?.trim()) {
            throw new Error('Comment text cannot be empty');
        }

        // Use transaction to ensure comment creation, count update, and notification
        const [newComment, post] = await prisma.$transaction(async (tx) => {
            const comment = await tx.comment.create({
                data: {
                    text: text,
                    authorId: userId,
                    postId: postId,
                },
            });

            const updatedPost = await tx.post.update({
                where: { id: postId },
                data: { commentsCount: { increment: 1 } },
                select: { authorId: true } // Select authorId for notification
            });

            return [comment, updatedPost];
        });
        
        // --- Create Notification --- 
        if (post && post.authorId !== userId) { // Don't notify self
             try {
                await prisma.notification.create({
                    data: {
                        recipientId: post.authorId,
                        actorId: userId,
                        postId: postId,
                        commentId: newComment.id, // Link to the created comment
                        type: 'COMMENT' // Correct type
                    }
                });
                 console.log(`[Notification] COMMENT notification created for post ${postId}, recipient ${post.authorId}`);
            } catch (error) {
                console.error(`[Notification Error] Failed to create COMMENT notification for post ${postId}:`, error);
            }
        }
        // --- End Create Notification ---

        return newComment;
    }

    /**
     * Get comments for a specific post with pagination.
     */
    public static async getCommentsByPostId(
        postId: number,
        options: { page?: number, limit?: number } = {}
    ): Promise<PaginatedCommentsResponse> {
        const { page = 1, limit = 10 } = options;
        const skip = (page - 1) * limit;

        const [commentsData, totalCount] = await prisma.$transaction([
            prisma.comment.findMany({
                where: { postId: postId },
                skip: skip,
                take: limit,
                orderBy: { createdAt: 'desc' }, // Show newest comments first
                include: {
                    author: { select: { id: true, name: true } } // Include author info
                }
            }),
            prisma.comment.count({
                where: { postId: postId }
            })
        ]);

        return { comments: commentsData, totalCount };
    }

    /**
     * Delete a comment by its ID, verifying ownership.
     */
    public static async deleteComment(userId: number, commentId: number): Promise<Comment> {
        const commentToDelete = await prisma.comment.findUnique({
            where: { id: commentId },
            select: { authorId: true, postId: true } // Select needed fields for validation and update
        });

        if (!commentToDelete) {
            throw new Error('Comment not found');
        }

        if (commentToDelete.authorId !== userId) {
            throw new Error('Unauthorized to delete this comment'); // Or use a specific error type/status
        }

        // Use transaction to ensure comment deletion and count update are atomic
        const deletedComment = await prisma.$transaction(async (tx) => {
            const comment = await tx.comment.delete({
                where: { id: commentId },
            });

            await tx.post.update({
                where: { id: commentToDelete.postId }, // Use postId from the fetched comment
                data: { commentsCount: { decrement: 1 } },
            });

            return comment;
        });

        return deletedComment;
    }
} 