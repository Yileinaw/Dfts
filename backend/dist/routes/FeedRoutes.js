"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/FeedRoutes.ts
const express_1 = require("express");
const FeedController_1 = require("../controllers/FeedController");
const router = (0, express_1.Router)();
// GET /api/feed/home - 获取首页 Feed
router.get('/home', FeedController_1.FeedController.getHomeFeed);
// GET /api/feed/discover - 获取发现页 Feed
router.get('/discover', FeedController_1.FeedController.getDiscoverFeed);
// GET /api/feed/community - 获取社区页 Feed
router.get('/community', FeedController_1.FeedController.getCommunityFeed);
exports.default = router;
//# sourceMappingURL=FeedRoutes.js.map