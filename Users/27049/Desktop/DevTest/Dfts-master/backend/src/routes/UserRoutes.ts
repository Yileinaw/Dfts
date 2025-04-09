import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { AuthMiddleware } from '../middleware/AuthMiddleware'; // 导入认证中间件

const router = Router();

// 定义用户路由
// GET /api/users/me - 获取当前用户信息
// 应用 AuthMiddleware 来保护这个路由
router.get('/me', AuthMiddleware, UserController.getCurrentUser);

// PUT /api/users/profile - 更新当前用户个人资料 (需要认证)
router.put('/profile', AuthMiddleware, UserController.updateProfile);

// 未来可以在这里添加其他用户相关的路由，例如更新用户信息
// router.put('/profile', AuthMiddleware, UserController.updateProfile);

export default router; 