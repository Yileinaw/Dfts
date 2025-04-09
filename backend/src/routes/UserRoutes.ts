import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { FavoriteController } from '../controllers/FavoriteController'; // 导入 FavoriteController
import { AuthMiddleware } from '../middleware/AuthMiddleware'; // 导入认证中间件
import { PostService } from '../services/PostService'; // Ensure PostService is imported if needed here (it's used in UserController)

console.log('[UserRoutes.ts] File executing...'); // <-- Add log

const router = Router();

// 定义用户路由
// GET /api/users/me - 获取当前用户信息
// 应用 AuthMiddleware 来保护这个路由
router.get('/me', AuthMiddleware, UserController.getCurrentUser);

// GET /api/users/me/favorites - 获取当前用户的收藏列表 (需要认证)
// Temporarily replace with a direct response for debugging (Revert this)
// router.get('/me/favorites', (req, res) => {
//  console.log("Accessed /me/favorites route handler!"); // Add specific log
//  res.status(200).json({ message: "Favorites route hit successfully!" });
// });
router.get('/me/favorites', AuthMiddleware, FavoriteController.getMyFavorites); // Restore original handler

// GET /api/users/me/posts - 获取当前用户的帖子列表 (Re-apply definition)
router.get('/me/posts', AuthMiddleware, (req, res, next) => {
    console.log('[UserRoutes.ts] Matched /me/posts route definition'); // <-- Add log
    UserController.getMyPosts(req, res).catch(next); // Call controller method
});

// PUT /api/users/profile - 更新当前用户个人资料 (需要认证)
router.put('/profile', AuthMiddleware, UserController.updateProfile);

// 未来可以在这里添加其他用户相关的路由，例如更新用户信息
// router.put('/profile', AuthMiddleware, UserController.updateProfile);

export default router; 