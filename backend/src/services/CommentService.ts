// backend/src/services/CommentService.ts
import prisma from '../db';
import { Comment, Post, Prisma, User, NotificationType } from '@prisma/client';

// Define AuthorInfo locally for this service
interface AuthorInfo {
    id: number;
    name: string | null;
    avatarUrl?: string | null;
}

// Update response type to include parentId and potentially replies count
interface CommentWithAuthor extends Omit<Comment, 'authorId' | 'postId' | 'parentId'> { // Also omit parentId as it's part of the main object
    parentId: number | null; // Explicitly include parentId here
    author: AuthorInfo; 
    repliesCount?: number;
}

interface PaginatedCommentsResponse {
    comments: CommentWithAuthor[];
    totalCount: number;
}

export class CommentService {

    /**
     * Create a new comment, optionally replying to another comment.
     */
    public static async createComment(userId: number, postId: number, text: string, parentId?: number | null): Promise<Comment> {
        if (!text?.trim()) {
            throw new Error('Comment text cannot be empty');
        }

        // Data for the new comment
        const commentData: Prisma.CommentCreateInput = {
            text: text,
            author: { connect: { id: userId } },
            post: { connect: { id: postId } },
        };

        // If parentId is provided, connect to the parent comment
        if (parentId) {
            // Optional: Verify parent comment exists and belongs to the same post
            const parentComment = await prisma.comment.findUnique({ where: { id: parentId }});
            if (!parentComment || parentComment.postId !== postId) {
                throw new Error('Invalid parent comment ID');
            }
            commentData.parent = { connect: { id: parentId } };
        }

        // Use transaction for comment creation, count update, and notifications
        const [newComment, post, parentAuthorId] = await prisma.$transaction(async (tx) => {
            const createdComment = await tx.comment.create({ data: commentData });

            const updatedPost = await tx.post.update({
                where: { id: postId },
                data: { commentsCount: { increment: 1 } },
                select: { authorId: true }
            });
            
            let parentCommentAuthorId: number | null = null;
            if (parentId) {
                const parent = await tx.comment.findUnique({ where: { id: parentId }, select: { authorId: true }});
                parentCommentAuthorId = parent?.authorId ?? null;
            }

            return [createdComment, updatedPost, parentCommentAuthorId];
        });
        
        // --- Create Notifications --- 
        // 1. Notify post author about a new comment (unless it's their own post)
        if (post && post.authorId !== userId) { 
             try {
                await prisma.notification.create({
                    data: {
                        recipientId: post.authorId,
                        actorId: userId,
                        postId: postId,
                        commentId: newComment.id, 
                        type: parentId ? NotificationType.REPLY : NotificationType.COMMENT
                    }
                });
                 console.log(`[Notification] ${parentId ? 'REPLY' : 'COMMENT'} notification created for post ${postId}, recipient ${post.authorId}`);
            } catch (error) {
                console.error(`[Notification Error] Failed to create ${parentId ? 'REPLY' : 'COMMENT'} notification for post ${postId}:`, error);
            }
        }
        // 2. Notify parent comment author about the reply (if it's a reply and not self-reply)
        if (parentId && parentAuthorId && parentAuthorId !== userId && parentAuthorId !== post?.authorId) {
             try {
                 await prisma.notification.create({
                     data: {
                         recipientId: parentAuthorId,
                         actorId: userId,
                         postId: postId, // Include post context
                         commentId: newComment.id, // Link to the new reply comment
                         type: NotificationType.REPLY
                     }
                 });
                 console.log(`[Notification] REPLY notification created for comment ${parentId}, recipient ${parentAuthorId}`);
             } catch (error) {
                 console.error(`[Notification Error] Failed to create REPLY notification for comment ${parentId}:`, error);
             }
        }
        // --- End Create Notifications ---

        return newComment;
    }

    /**
     * Get comments for a specific post with pagination, including parentId and replies count.
     */
    public static async getCommentsByPostId(
        postId: number,
        options: { page?: number, limit?: number, currentUserId?: number } = {}
    ): Promise<PaginatedCommentsResponse> {
        const { page = 1, limit = 10, currentUserId } = options;
        const skip = (page - 1) * limit;

        // Get top-level comments first (or all comments if not handling hierarchy server-side initially)
        // For simplicity now, fetch all comments and let frontend handle hierarchy
        const whereClause: Prisma.CommentWhereInput = { postId: postId };

        const [commentsData, totalCount] = await prisma.$transaction([
            prisma.comment.findMany({
                where: whereClause,
                skip: skip,
                take: limit,
                orderBy: { createdAt: 'asc' }, // Order by oldest first for potential nesting display
                select: {
                    id: true,
                    text: true,
                    createdAt: true,
                    updatedAt: true,
                    authorId: true,
                    postId: true,
                    parentId: true,
                    author: { select: { id: true, name: true, avatarUrl: true } },
                    _count: { select: { replies: true } },
                }
            }),
            prisma.comment.count({ where: whereClause })
        ]);

        // Map data to include repliesCount and ensure correct author type
        const comments: CommentWithAuthor[] = commentsData.map(comment => {
            const { _count, author, authorId, postId, parentId, ...restOfComment } = comment;
            return {
                ...restOfComment,
                parentId: parentId,
                author: author as AuthorInfo,
                repliesCount: _count?.replies || 0
            };
        });

        return { comments, totalCount };
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