// src/routes/FeedRoutes.ts
import { Router } from 'express';
import { FeedController } from '../controllers/FeedController';

const router = Router();

// GET /api/feed/home - 获取首页 Feed
router.get('/home', FeedController.getHomeFeed);

// GET /api/feed/discover - 获取发现页 Feed
router.get('/discover', FeedController.getDiscoverFeed);

// GET /api/feed/community - 获取社区页 Feed
router.get('/community', FeedController.getCommunityFeed);

export default router; 