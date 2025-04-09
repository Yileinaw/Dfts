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
exports.PostController = void 0;
const PostService_1 = require("../services/PostService");
class PostController {
    // 处理创建帖子的请求
    static createPost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const post = yield PostService_1.PostService.createPost({ title, content, authorId });
                res.status(201).json({ message: 'Post created successfully', post });
            }
            catch (error) {
                console.error('Create Post Error:', error);
                res.status(500).json({ message: 'Internal server error creating post' });
            }
        });
    }
    // 处理获取所有帖子的请求
    static getAllPosts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || undefined;
                const limit = parseInt(req.query.limit) || undefined;
                const sortBy = req.query.sortBy || undefined;
                const currentUserId = req.userId; // Get userId from AuthMiddleware (if logged in)
                const { posts, totalCount } = yield PostService_1.PostService.getAllPosts({ page, limit, sortBy, currentUserId });
                res.status(200).json({ posts, totalCount });
            }
            catch (error) {
                console.error('Get All Posts Error:', error);
                res.status(500).json({ message: 'Internal server error retrieving posts' });
            }
        });
    }
    // 处理获取单个帖子的请求
    static getPostById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const postId = parseInt(req.params.id, 10);
                const currentUserId = req.userId; // Get current user ID from authenticated request
                if (isNaN(postId)) {
                    res.status(400).json({ message: 'Invalid post ID' });
                    return;
                }
                const post = yield PostService_1.PostService.getPostById(postId, currentUserId);
                if (!post) {
                    res.status(404).json({ message: 'Post not found' });
                    return;
                }
                res.status(200).json({ post });
            }
            catch (error) {
                console.error('Get Post By ID Error:', error);
                res.status(500).json({ message: 'Failed to retrieve post' });
            }
        });
    }
    // 处理更新帖子的请求
    static updatePost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const updatedPost = yield PostService_1.PostService.updatePost(postId, { title, content }, userId);
                if (!updatedPost) {
                    // PostService 返回 null 通常意味着帖子不存在
                    res.status(404).json({ message: 'Post not found' });
                }
                else {
                    res.status(200).json({ message: 'Post updated successfully', post: updatedPost });
                }
            }
            catch (error) {
                if (error.message.startsWith('Forbidden')) {
                    res.status(403).json({ message: error.message }); // 403 Forbidden
                }
                else {
                    console.error('Update Post Error:', error);
                    res.status(500).json({ message: 'Internal server error updating post' });
                }
            }
        });
    }
    // 处理删除帖子的请求
    static deletePost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const deletedPost = yield PostService_1.PostService.deletePost(postId, userId);
                if (!deletedPost) {
                    // PostService 返回 null 通常意味着帖子不存在
                    res.status(404).json({ message: 'Post not found' });
                }
                else {
                    res.status(200).json({ message: 'Post deleted successfully', post: deletedPost });
                    // 或者返回 204 No Content 状态码，不带响应体
                    // res.status(204).send();
                }
            }
            catch (error) {
                if (error.message.startsWith('Forbidden')) {
                    res.status(403).json({ message: error.message }); // 403 Forbidden
                }
                else {
                    console.error('Delete Post Error:', error);
                    res.status(500).json({ message: 'Internal server error deleting post' });
                }
            }
        });
    }
}
exports.PostController = PostController;
//# sourceMappingURL=PostController.js.map