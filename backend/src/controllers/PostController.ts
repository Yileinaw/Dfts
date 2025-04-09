// src/controllers/PostController.ts
import { Request, Response } from 'express';
import { PostService } from '../services/PostService';
import { AuthenticatedRequest } from '../middleware/AuthMiddleware'; // 需要 userId 进行权限检查

export class PostController {
    // 处理创建帖子的请求
    public static async createPost(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { title, content } = req.body;
            const authorId = req.userId; // 从认证中间件获取

            if (!authorId) {
                res.status(401).json({ message: 'Unauthorized: User ID not found' });
                return;
            }
            if (!title) {
                res.status(400).json({ message: 'Title is required' });
                return;
            }

            const post = await PostService.createPost({ title, content, authorId });
            res.status(201).json({ message: 'Post created successfully', post });
        } catch (error: any) {
            console.error('Create Post Error:', error);
            res.status(500).json({ message: 'Internal server error creating post' });
        }
    }

    // 处理获取所有帖子的请求
    public static async getAllPosts(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || undefined;
            const limit = parseInt(req.query.limit as string) || undefined;
            const sortBy = req.query.sortBy as string || undefined;
            const currentUserId = req.userId; // Get userId from AuthMiddleware (if logged in)

            const { posts, totalCount } = await PostService.getAllPosts({ page, limit, sortBy, currentUserId });

            res.status(200).json({ posts, totalCount });
        } catch (error: any) {
            console.error('Get All Posts Error:', error);
            res.status(500).json({ message: 'Internal server error retrieving posts' });
        }
    }

    // 处理获取单个帖子的请求
    public static async getPostById(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const postId = parseInt(req.params.id, 10);
            const currentUserId = req.userId;

            if (isNaN(postId)) {
                res.status(400).json({ message: 'Invalid post ID' });
                return;
            }

            const post = await PostService.getPostById(postId, currentUserId);

            if (!post) {
                res.status(404).json({ message: 'Post not found' });
                return;
            }
            res.status(200).json({ post });
        } catch (error: any) {
            console.error('Get Post By ID Error:', error);
            res.status(500).json({ message: 'Failed to retrieve post' });
        }
    }

    // 处理更新帖子的请求
    public static async updatePost(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const postId = parseInt(req.params.id, 10);
            const { title, content } = req.body;
            const userId = req.userId;

            if (isNaN(postId)) {
                res.status(400).json({ message: 'Invalid post ID' });
                return;
            }
            if (!userId) {
                res.status(401).json({ message: 'Unauthorized: User ID not found' });
                return;
            }
            // 至少需要 title 或 content 中的一个来更新
            if (title === undefined && content === undefined) {
                res.status(400).json({ message: 'No update data provided (title or content)' });
                return;
            }


            const updatedPost = await PostService.updatePost(postId, { title, content }, userId);

            if (!updatedPost) {
                // PostService 返回 null 通常意味着帖子不存在
                res.status(404).json({ message: 'Post not found' });
            } else {
                res.status(200).json({ message: 'Post updated successfully', post: updatedPost });
            }
        } catch (error: any) {
            if (error.message.startsWith('Forbidden')) {
                res.status(403).json({ message: error.message }); // 403 Forbidden
            } else {
                console.error('Update Post Error:', error);
                res.status(500).json({ message: 'Internal server error updating post' });
            }
        }
    }

    // 处理删除帖子的请求
    public static async deletePost(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const postId = parseInt(req.params.id, 10);
            const userId = req.userId;

            if (isNaN(postId)) {
                res.status(400).json({ message: 'Invalid post ID' });
                return;
            }
            if (!userId) {
                res.status(401).json({ message: 'Unauthorized: User ID not found' });
                return;
            }

            const deletedPost = await PostService.deletePost(postId, userId);

            if (!deletedPost) {
                // PostService 返回 null 通常意味着帖子不存在
                res.status(404).json({ message: 'Post not found' });
            } else {
                res.status(200).json({ message: 'Post deleted successfully', post: deletedPost });
                // 或者返回 204 No Content 状态码，不带响应体
                // res.status(204).send();
            }
        } catch (error: any) {
            if (error.message.startsWith('Forbidden')) {
                res.status(403).json({ message: error.message }); // 403 Forbidden
            } else {
                console.error('Delete Post Error:', error);
                res.status(500).json({ message: 'Internal server error deleting post' });
            }
        }
    }
} 