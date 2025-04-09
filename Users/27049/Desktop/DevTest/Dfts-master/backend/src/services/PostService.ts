// src/services/PostService.ts
import prisma from '../db';
import { Post, Prisma, Like } from '@prisma/client';

// --- 定义包含总数的响应类型 ---
interface PaginatedPostsResponse {
    posts: (Post & { isLiked?: boolean; isFavorited?: boolean; commentsCount?: number; favoritesCount?: number })[];
    totalCount: number;
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
        let orderBy: any = { createdAt: 'desc' };
        if (sortBy === 'popular') { orderBy = { likesCount: 'desc' }; } // 现在可以按 likesCount 排序

        // --- Add where clause for filtering by authorId --- 
        const whereClause: Prisma.PostWhereInput = {};
        if (authorId) {
            whereClause.authorId = authorId;
        }
        // --- End where clause ---

        const [postsData, totalCount] = await prisma.$transaction([
            prisma.post.findMany({
                where: whereClause, // Apply where clause
                skip: skip,
                take: limit,
                orderBy: orderBy,
                select: {
                    id: true,
                    title: true,
                    content: true,
                    createdAt: true,
                    updatedAt: true,
                    authorId: true,
                    author: { select: { id: true, name: true } },
                    likesCount: true,
                    commentsCount: true,
                    favoritesCount: true,
                    ...(currentUserId && {
                        likedBy: {
                            where: { userId: currentUserId },
                            select: { userId: true }
                        },
                        favoritedBy: {
                            where: { userId: currentUserId },
                            select: { userId: true }
                        }
                    })
                }
            }),
            prisma.post.count({ where: whereClause }) // Apply where clause to count too
        ]);

        // --- Process data (map isLiked and isFavorited) --- 
        const posts = postsData.map(post => {
            const { likedBy, favoritedBy, ...restOfPost } = post as any;
            const isLiked = !!likedBy && likedBy.length > 0;
            const isFavorited = !!favoritedBy && favoritedBy.length > 0;
            return { ...restOfPost, isLiked, isFavorited };
        });

        return { posts, totalCount };
    }

    // 根据 ID 获取单个帖子
    public static async getPostById(postId: number, currentUserId?: number): Promise<(Post & { isLiked?: boolean; isFavorited?: boolean; commentsCount?: number; favoritesCount?: number }) | null> {
        const postData = await prisma.post.findUnique({
            where: { id: postId },
            select: {
                id: true,
                title: true,
                content: true,
                createdAt: true,
                updatedAt: true,
                authorId: true,
                author: { select: { id: true, name: true, email: true } },
                likesCount: true,
                commentsCount: true,
                favoritesCount: true,
                ...(currentUserId && {
                    likedBy: {
                        where: { userId: currentUserId },
                        select: { userId: true }
                    },
                    favoritedBy: {
                        where: { userId: currentUserId },
                        select: { userId: true }
                    }
                })
            }
        });

        if (!postData) return null;

        // --- Process data (map isLiked and isFavorited) --- 
        const { likedBy, favoritedBy, ...restOfPost } = postData as any;
        const isLiked = !!likedBy && likedBy.length > 0;
        const isFavorited = !!favoritedBy && favoritedBy.length > 0;

        return { ...restOfPost, isLiked, isFavorited };
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
} 