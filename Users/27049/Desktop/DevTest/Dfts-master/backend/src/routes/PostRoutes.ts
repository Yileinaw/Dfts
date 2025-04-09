// src/routes/PostRoutes.ts
import { Router } from 'express';
import { PostController } from '../controllers/PostController';
import { LikeController } from '../controllers/LikeController'; // Import LikeController
import { CommentController } from '../controllers/CommentController'; // Import CommentController
import { AuthMiddleware } from '../middleware/AuthMiddleware'; // 导入认证中间件
import { OptionalAuthMiddleware } from '../middleware/OptionalAuthMiddleware'; // Import optional auth
import { FavoriteController } from '../controllers/FavoriteController'; // Import FavoriteController

const postRouter = Router();

// --- Comment Routes (nested under posts) ---
// POST /api/posts/:postId/comments - Create a comment (requires auth)
postRouter.post('/:postId/comments', AuthMiddleware, CommentController.createComment);

// GET /api/posts/:postId/comments - Get comments for a post (public, optional auth for future use)
postRouter.get('/:postId/comments', OptionalAuthMiddleware, CommentController.getCommentsByPostId);

// --- Existing post routes ---
// GET /api/posts - Use Optional Auth
postRouter.get('/', OptionalAuthMiddleware, PostController.getAllPosts);

// POST /api/posts - Requires Auth
postRouter.post('/', AuthMiddleware, PostController.createPost);

// GET /api/posts/:id - Use Optional Auth
postRouter.get('/:id', OptionalAuthMiddleware, PostController.getPostById);

// PUT /api/posts/:id - Requires Auth
postRouter.put('/:id', AuthMiddleware, PostController.updatePost);

// DELETE /api/posts/:id - Requires Auth
postRouter.delete('/:id', AuthMiddleware, PostController.deletePost);

// --- Like routes ---
// POST /api/posts/:postId/like - Requires Auth
postRouter.post('/:postId/like', AuthMiddleware, LikeController.likePost);

// DELETE /api/posts/:postId/like - Requires Auth
postRouter.delete('/:postId/like', AuthMiddleware, LikeController.unlikePost);

// --- Favorite Routes ---
// POST /api/posts/:postId/favorite - Requires Auth
postRouter.post('/:postId/favorite', AuthMiddleware, FavoriteController.favoritePost);

// DELETE /api/posts/:postId/favorite - Requires Auth
postRouter.delete('/:postId/favorite', AuthMiddleware, FavoriteController.unfavoritePost);
// --- End Favorite Routes ---

// --- Separate Comment Deletion Route ---
const commentRouter = Router();
// DELETE /api/comments/:commentId - Delete a comment (requires auth)
commentRouter.delete('/:commentId', AuthMiddleware, CommentController.deleteComment);

// Export both routers
export { postRouter, commentRouter }; 