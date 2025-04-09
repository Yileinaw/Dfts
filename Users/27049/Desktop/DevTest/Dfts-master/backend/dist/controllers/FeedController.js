"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedController = void 0;
const PostService_1 = require("../services/PostService"); // 复用 PostService 来获取帖子
class FeedController {
    // 获取首页 Feed (暂时返回最新帖子)
    static getHomeFeed(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || undefined;
                const limit = parseInt(req.query.limit) || undefined;
                // 未来可以加入更复杂的推荐逻辑
                const posts = yield PostService_1.PostService.getAllPosts({ page, limit });
                res.status(200).json({ posts });
            }
            catch (error) {
                console.error('Get Home Feed Error:', error);
                res.status(500).json({ message: 'Internal server error retrieving home feed' });
            }
        });
    }
    // 获取发现页 Feed (暂时返回最新帖子)
    static getDiscoverFeed(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || undefined;
                const limit = parseInt(req.query.limit) || undefined;
                // 未来可以加入不同的排序或过滤逻辑，例如热门
                const posts = yield PostService_1.PostService.getAllPosts({ page, limit });
                res.status(200).json({ posts });
            }
            catch (error) {
                console.error('Get Discover Feed Error:', error);
                res.status(500).json({ message: 'Internal server error retrieving discover feed' });
            }
        });
    }
    // 获取社区页 Feed (暂时返回最新帖子)
    static getCommunityFeed(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || undefined;
                const limit = parseInt(req.query.limit) || undefined;
                // 未来可以根据社区 ID 或其他条件过滤
                const posts = yield PostService_1.PostService.getAllPosts({ page, limit });
                res.status(200).json({ posts });
            }
            catch (error) {
                console.error('Get Community Feed Error:', error);
                res.status(500).json({ message: 'Internal server error retrieving community feed' });
            }
        });
    }
}
exports.FeedController = FeedController;
//# sourceMappingURL=FeedController.js.map