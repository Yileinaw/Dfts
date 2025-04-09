// src/services/PostService.ts
import prisma from '../db';
import { Post, Prisma } from '@prisma/client';

// --- 定义包含总数的响应类型 ---
interface PaginatedPostsResponse {
    posts: (Post & { isLiked?: boolean, commentsCount?: number })[];
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
    public static async getAllPosts(options: { page?: number, limit?: number, sortBy?: string, currentUserId?: number } = {}): Promise<PaginatedPostsResponse> {
        const { page = 1, limit = 10, sortBy = 'latest', currentUserId } = options;
        const skip = (page - 1) * limit;
        let orderBy: any = { createdAt: 'desc' };
        if (sortBy === 'popular') { orderBy = { likesCount: 'desc' }; } // 现在可以按 likesCount 排序

        const [postsData, totalCount] = await prisma.$transaction([
            prisma.post.findMany({
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
                    ...(currentUserId && {
                        likedBy: {
                            where: { userId: currentUserId },
                            select: { userId: true }
                        }
                    })
                }
            }),
            prisma.post.count({ /* TODO: Add where clause if filtering is needed */ })
        ]);

        // --- Process data (map isLiked) --- 
        const posts = postsData.map(post => {
            const { likedBy, ...restOfPost } = post as any;
            const isLiked = !!likedBy && likedBy.length > 0;
            return { ...restOfPost, isLiked };
        });

        return { posts, totalCount };
    }

    // 根据 ID 获取单个帖子
    public static async getPostById(postId: number, currentUserId?: number): Promise<(Post & { isLiked?: boolean, commentsCount?: number }) | null> {
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
                ...(currentUserId && {
                    likedBy: {
                        where: { userId: currentUserId },
                        select: { userId: true }
                    }
                })
            }
        });

        if (!postData) return null;

        // --- Process data (map isLiked) --- 
        const { likedBy, ...restOfPost } = postData as any;
        const isLiked = !!likedBy && likedBy.length > 0;

        return { ...restOfPost, isLiked };
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
} 