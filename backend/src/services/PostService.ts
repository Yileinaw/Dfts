// src/services/PostService.ts
import prisma from '../db';
import { Post, Prisma, Like, User, Comment, Notification } from '@prisma/client';

// Define the expected shape of the author object
interface AuthorInfo {
  id: number;
  name: string | null;
  avatarUrl?: string | null; // Add avatarUrl
}

// Define the expected shape of the author object for Comments
interface CommentAuthorInfo {
    id: number;
    name: string | null;
    avatarUrl?: string | null;
}

// Update the Post type within the response to include the correct author shape
interface PostWithAuthor extends Omit<Post, 'authorId'> { 
    author: AuthorInfo; 
    isLiked?: boolean; 
    isFavorited?: boolean; 
}

interface PaginatedPostsResponse {
    posts: PostWithAuthor[];
    totalCount: number;
}

// Update return type for single post to include AuthorInfo
type PostWithDetails = PostWithAuthor | null;

// Define the shape of a Comment with its author details
interface CommentWithAuthor extends Omit<Comment, 'authorId' | 'postId'> {
    author: CommentAuthorInfo;
}

export class PostService {
    // 创建帖子
    public static async createPost(postData: { title: string; content?: string; authorId: number }): Promise<Post> {
        const { title, content, authorId } = postData;
        const post = await prisma.post.create({
            data: {
                title,
                content,
                author: { // 关联到作者
                    connect: { id: authorId },
                },
            },
        });
        return post;
    }

    // 获取所有帖子（可添加分页、过滤等）
    public static async getAllPosts(options: { page?: number, limit?: number, sortBy?: string, currentUserId?: number, authorId?: number } = {}): Promise<PaginatedPostsResponse> {
        const { page = 1, limit = 10, sortBy = 'latest', currentUserId, authorId } = options;
        const skip = (page - 1) * limit;
        let orderBy: Prisma.PostOrderByWithRelationInput = { createdAt: 'desc' };
        if (sortBy === 'popular') { orderBy = { likesCount: 'desc' }; }

        const whereClause: Prisma.PostWhereInput = {};
        if (authorId) { whereClause.authorId = authorId; }

        const [postsData, totalCount] = await prisma.$transaction([
            prisma.post.findMany({
                where: whereClause,
                skip: skip,
                take: limit,
                orderBy: orderBy,
                select: {
                    id: true,
                    title: true,
                    content: true,
                    createdAt: true,
                    updatedAt: true,
                    author: { 
                        select: { 
                            id: true, 
                            name: true, 
                            avatarUrl: true // Ensure this is selected
                        } 
                    },
                    likesCount: true,
                    commentsCount: true,
                    favoritesCount: true,
                    // Conditionally select relations based on currentUserId
                    ...(currentUserId && {
                        likedBy: { 
                            where: { userId: currentUserId }, 
                            select: { userId: true } // Select minimal field
                        },
                        favoritedBy: { 
                            where: { userId: currentUserId }, 
                            select: { userId: true } // Select minimal field
                        }
                    })
                }
            }),
            prisma.post.count({ where: whereClause })
        ]);

        // Process posts to add flags and ensure correct type
        const posts: PostWithAuthor[] = postsData.map(post => {
            // Type assertion is needed because Prisma's select type doesn't perfectly match our desired structure with conditional fields
            const fullPost = post as any;
            const isLiked = !!fullPost.likedBy?.length;
            const isFavorited = !!fullPost.favoritedBy?.length;
            
            // Remove temporary fields if they exist
            delete fullPost.likedBy;
            delete fullPost.favoritedBy;

            // Ensure author has the correct shape (already selected by Prisma)
            const author: AuthorInfo = fullPost.author;
            
            return { ...fullPost, author, isLiked, isFavorited };
        });

        return { posts, totalCount };
    }

    // 根据 ID 获取单个帖子
    public static async getPostById(postId: number, currentUserId?: number): Promise<PostWithDetails | null> {
        const postData = await prisma.post.findUnique({
             where: { id: postId },
             select: {
                 id: true,
                 title: true,
                 content: true,
                 createdAt: true,
                 updatedAt: true,
                 author: { 
                     select: { 
                         id: true, 
                         name: true, 
                         avatarUrl: true 
                     } 
                 },
                 likesCount: true,
                 commentsCount: true,
                 favoritesCount: true,
                 ...(currentUserId && {
                     likedBy: { where: { userId: currentUserId }, select: { userId: true } },
                     favoritedBy: { where: { userId: currentUserId }, select: { userId: true } }
                 })
             }
        });

        if (!postData) return null;

        // Process data
        const fullPost = postData as any;
        const isLiked = !!fullPost.likedBy?.length;
        const isFavorited = !!fullPost.favoritedBy?.length;
        delete fullPost.likedBy;
        delete fullPost.favoritedBy;
        const author = fullPost.author ? {
            id: fullPost.author.id,
            name: fullPost.author.name,
            avatarUrl: fullPost.author.avatarUrl
        } : null;

        const result = { ...fullPost, author, isLiked, isFavorited };

        return result;
    }

    // 更新帖子
    public static async updatePost(postId: number, postData: { title?: string; content?: string }, userId: number): Promise<Post | null> {
        // 1. 检查帖子是否存在且属于该用户
        const post = await prisma.post.findUnique({
            where: { id: postId },
        });
        if (!post) {
            return null; // 或抛出错误表明帖子不存在
        }
        if (post.authorId !== userId) {
            throw new Error('Forbidden: You can only update your own posts');
        }

        // 2. 更新帖子
        const updatedPost = await prisma.post.update({
            where: { id: postId },
            data: {
                title: postData.title,
                content: postData.content,
            },
        });
        return updatedPost;
    }

    // 删除帖子
    public static async deletePost(postId: number, userId: number): Promise<Post | null> {
        // 1. 检查帖子是否存在且属于该用户
        const post = await prisma.post.findUnique({
            where: { id: postId },
        });
        if (!post) {
            return null; // 或抛出错误表明帖子不存在
        }
        if (post.authorId !== userId) {
            throw new Error('Forbidden: You can only delete your own posts');
        }

        // 2. 删除帖子
        await prisma.post.delete({
            where: { id: postId },
        });
        return post; // 返回被删除的帖子信息
    }

    // Like a post
    public static async likePost(userId: number, postId: number): Promise<Like | null> {
        // Check if already liked
        const existingLike = await prisma.like.findUnique({
            where: { userId_postId: { userId, postId } }
        });
        if (existingLike) {
            return existingLike; // Already liked
        }

        // Use transaction to create like, increment count, and create notification
        const [newLike, post] = await prisma.$transaction(async (tx) => {
            const like = await tx.like.create({
                data: { userId, postId }
            });
            const updatedPost = await tx.post.update({
                where: { id: postId },
                data: { likesCount: { increment: 1 } },
                select: { authorId: true } // Select authorId for notification
            });
            return [like, updatedPost];
        });

        // --- Create Notification --- 
        if (post && post.authorId !== userId) { // Don't notify self
            try {
                await prisma.notification.create({
                    data: {
                        recipientId: post.authorId,
                        actorId: userId,
                        postId: postId,
                        type: 'LIKE'
                    }
                });
                 console.log(`[Notification] LIKE notification created for post ${postId}, recipient ${post.authorId}`);
            } catch (error) {
                console.error(`[Notification Error] Failed to create LIKE notification for post ${postId}:`, error);
                // Decide if this error should affect the main response
            }
        }
        // --- End Create Notification ---

        return newLike;
    }

    // Unlike a post (No notification needed for unlike)
    public static async unlikePost(userId: number, postId: number): Promise<Like | null> {
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId,
                },
            },
        });

        if (existingLike) {
            await prisma.like.delete({
                where: {
                    userId_postId: {
                        userId,
                        postId,
                    },
                },
            });
            // Optionally return the deleted like, but returning null is simpler
            // and fulfills the Promise<Like | null> contract if nothing is found later.
            // return existingLike; 
        }
        // Always return null, whether a like was found and deleted or not.
        return null;
    }

    // --- Comment Methods ---

    // Create a new comment or reply
    public static async createComment(
        postId: number, 
        commentData: { text: string; authorId: number; parentId?: number | null }
    ): Promise<Comment> {
        const { text, authorId, parentId } = commentData;

        // Use a transaction to ensure atomicity: create comment, update count, create notification
        const [newComment, postAuthorData] = await prisma.$transaction(async (tx) => {
            // 1. Create the comment
            const comment = await tx.comment.create({
                data: {
                    text,
                    postId,
                    authorId,
                    parentId: parentId ?? undefined, // Use undefined if parentId is null/undefined
                },
            });

            // 2. Increment the post's comments count and get post author ID
            const postUpdate = await tx.post.update({
                where: { id: postId },
                data: { commentsCount: { increment: 1 } },
                select: { authorId: true } // Select only needed field
            });

            return [comment, postUpdate];
        });

        // 3. Create Notification for the post author (if not self-commenting)
        if (postAuthorData && postAuthorData.authorId !== authorId) {
            try {
                await prisma.notification.create({
                    data: {
                        recipientId: postAuthorData.authorId,
                        actorId: authorId,
                        postId: postId,
                        commentId: newComment.id, // Link notification to the new comment
                        type: parentId ? 'REPLY' : 'COMMENT', // Different type for reply?
                    },
                });
                 console.log(`[Notification] ${parentId ? 'REPLY' : 'COMMENT'} notification created for post ${postId}, recipient ${postAuthorData.authorId}, comment ${newComment.id}`);
            } catch (error) {
                console.error(`[Notification Error] Failed to create ${parentId ? 'REPLY' : 'COMMENT'} notification for post ${postId}:`, error);
            }
        }
        
        // TODO: Consider adding notification for the parent comment author if it's a reply

        return newComment;
    }

    // Get comments for a post
    public static async getCommentsByPostId(postId: number): Promise<CommentWithAuthor[]> {
        const comments = await prisma.comment.findMany({
            where: { postId: postId },
            orderBy: { createdAt: 'asc' }, // Fetch comments chronologically
            select: {
                id: true,
                text: true,
                createdAt: true,
                updatedAt: true,
                parentId: true,
                // Select author details using the relation
                author: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                    },
                },
                // Note: We don't select postId or authorId directly as they are included via the relation/where clause
            },
        });

        // Map the Prisma result to our CommentWithAuthor structure
        // Prisma's select should already match this structure closely
        return comments.map(comment => ({
            ...comment,
            // Explicitly structure the author part to match CommentAuthorInfo, although Prisma's select does this
            author: {
                id: comment.author.id,
                name: comment.author.name,
                avatarUrl: comment.author.avatarUrl,
            },
        }));
    }

    // Delete a comment
    public static async deleteComment(commentId: number, userId: number): Promise<Comment | null> {
        // 1. Find the comment to check ownership and get postId
        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
            select: { authorId: true, postId: true }, // Select necessary fields
        });

        if (!comment) {
            return null; // Comment not found
        }

        // 2. Check if the user is the author
        if (comment.authorId !== userId) {
            // In a real app, throwing a specific error might be better
            throw new Error('Forbidden: You can only delete your own comments');
        }

        // 3. Use a transaction to delete the comment and decrement the post's count
        try {
            const [deletedComment] = await prisma.$transaction(async (tx) => {
                // First, delete the comment itself
                // WARNING: This does NOT handle child comments gracefully yet.
                // Child comments will become orphaned (parentId points to non-existent comment).
                // A more robust solution would involve finding child comments and either deleting them
                // or setting their parentId to null.
                const deleted = await tx.comment.delete({
                    where: { id: commentId },
                });

                // Then, decrement the comments count on the related post
                await tx.post.update({
                    where: { id: comment.postId },
                    data: { commentsCount: { decrement: 1 } },
                });

                // TODO: Consider deleting related notifications (COMMENT/REPLY)

                return [deleted]; // Return the deleted comment from transaction
            });
            return deletedComment;
        } catch (error) {
            console.error(`[PostService.deleteComment] Error during transaction for comment ${commentId}:`, error);
            // Depending on the error type, you might want to throw or return null
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                // Handle specific Prisma errors if needed
            }
            throw error; // Re-throw the error for the controller to handle
        }
    }

    // --- End Comment Methods ---
} 