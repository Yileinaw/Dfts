// src/controllers/FeedController.ts
import { Request, Response } from 'express';
import { PostService } from '../services/PostService'; // 复用 PostService 来获取帖子

export class FeedController {
    // 获取首页 Feed (暂时返回最新帖子)
    public static async getHomeFeed(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || undefined;
            const limit = parseInt(req.query.limit as string) || undefined;
            // 未来可以加入更复杂的推荐逻辑
            const posts = await PostService.getAllPosts({ page, limit });
            res.status(200).json({ posts });
        } catch (error: any) {
            console.error('Get Home Feed Error:', error);
            res.status(500).json({ message: 'Internal server error retrieving home feed' });
        }
    }

    // 获取发现页 Feed (暂时返回最新帖子)
    public static async getDiscoverFeed(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || undefined;
            const limit = parseInt(req.query.limit as string) || undefined;
            // 未来可以加入不同的排序或过滤逻辑，例如热门
            const posts = await PostService.getAllPosts({ page, limit });
            res.status(200).json({ posts });
        } catch (error: any) {
            console.error('Get Discover Feed Error:', error);
            res.status(500).json({ message: 'Internal server error retrieving discover feed' });
        }
    }

    // 获取社区页 Feed (暂时返回最新帖子)
    public static async getCommunityFeed(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || undefined;
            const limit = parseInt(req.query.limit as string) || undefined;
            // 未来可以根据社区 ID 或其他条件过滤
            const posts = await PostService.getAllPosts({ page, limit });
            res.status(200).json({ posts });
        } catch (error: any) {
            console.error('Get Community Feed Error:', error);
            res.status(500).json({ message: 'Internal server error retrieving community feed' });
        }
    }
} 