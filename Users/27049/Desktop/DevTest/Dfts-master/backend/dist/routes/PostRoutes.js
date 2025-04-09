"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentRouter = exports.postRouter = void 0;
// src/routes/PostRoutes.ts
const express_1 = require("express");
const PostController_1 = require("../controllers/PostController");
const LikeController_1 = require("../controllers/LikeController"); // Import LikeController
const CommentController_1 = require("../controllers/CommentController"); // Import CommentController
const AuthMiddleware_1 = require("../middleware/AuthMiddleware"); // 导入认证中间件
const OptionalAuthMiddleware_1 = require("../middleware/OptionalAuthMiddleware"); // Import optional auth
const FavoriteController_1 = require("../controllers/FavoriteController"); // Import FavoriteController
const postRouter = (0, express_1.Router)();
exports.postRouter = postRouter;
// --- Comment Routes (nested under posts) ---
// POST /api/posts/:postId/comments - Create a comment (requires auth)
postRouter.post('/:postId/comments', AuthMiddleware_1.AuthMiddleware, CommentController_1.CommentController.createComment);
// GET /api/posts/:postId/comments - Get comments for a post (public, optional auth for future use)
postRouter.get('/:postId/comments', OptionalAuthMiddleware_1.OptionalAuthMiddleware, CommentController_1.CommentController.getCommentsByPostId);
// --- Existing post routes ---
// GET /api/posts - Use Optional Auth
postRouter.get('/', OptionalAuthMiddleware_1.OptionalAuthMiddleware, PostController_1.PostController.getAllPosts);
// POST /api/posts - Requires Auth
postRouter.post('/', AuthMiddleware_1.AuthMiddleware, PostController_1.PostController.createPost);
// GET /api/posts/:id - Use Optional Auth
postRouter.get('/:id', OptionalAuthMiddleware_1.OptionalAuthMiddleware, PostController_1.PostController.getPostById);
// PUT /api/posts/:id - Requires Auth
postRouter.put('/:id', AuthMiddleware_1.AuthMiddleware, PostController_1.PostController.updatePost);
// DELETE /api/posts/:id - Requires Auth
postRouter.delete('/:id', AuthMiddleware_1.AuthMiddleware, PostController_1.PostController.deletePost);
// --- Like routes ---
// POST /api/posts/:postId/like - Requires Auth
postRouter.post('/:postId/like', AuthMiddleware_1.AuthMiddleware, LikeController_1.LikeController.likePost);
// DELETE /api/posts/:postId/like - Requires Auth
postRouter.delete('/:postId/like', AuthMiddleware_1.AuthMiddleware, LikeController_1.LikeController.unlikePost);
// --- Favorite Routes ---
// POST /api/posts/:postId/favorite - Requires Auth
postRouter.post('/:postId/favorite', AuthMiddleware_1.AuthMiddleware, FavoriteController_1.FavoriteController.favoritePost);
// DELETE /api/posts/:postId/favorite - Requires Auth
postRouter.delete('/:postId/favorite', AuthMiddleware_1.AuthMiddleware, FavoriteController_1.FavoriteController.unfavoritePost);
// --- End Favorite Routes ---
// --- Separate Comment Deletion Route ---
const commentRouter = (0, express_1.Router)();
exports.commentRouter = commentRouter;
// DELETE /api/comments/:commentId - Delete a comment (requires auth)
commentRouter.delete('/:commentId', AuthMiddleware_1.AuthMiddleware, CommentController_1.CommentController.deleteComment);
//# sourceMappingURL=PostRoutes.js.map