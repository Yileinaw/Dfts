"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const UserController_1 = require("../controllers/UserController");
const FavoriteController_1 = require("../controllers/FavoriteController"); // 导入 FavoriteController
const AuthMiddleware_1 = require("../middleware/AuthMiddleware"); // 导入认证中间件和 AuthenticatedRequest
const multerConfig_1 = __importDefault(require("../config/multerConfig")); // 导入 multer 配置
// console.log('[UserRoutes.ts] File executing...'); // Remove log
const userRouter = (0, express_1.Router)();
exports.userRouter = userRouter;
// 定义用户路由
// GET /api/users/me - 获取当前用户信息
// 应用 AuthMiddleware 来保护这个路由
userRouter.get('/me', AuthMiddleware_1.AuthMiddleware, UserController_1.UserController.getCurrentUserProfile);
// GET /api/users/me/favorites - 获取当前用户的收藏列表 (需要认证)
userRouter.get('/me/favorites', AuthMiddleware_1.AuthMiddleware, (req, res, next) => {
    // console.log(`[UserRoutes.ts] Matched /me/favorites route for user ${req.userId}. Calling FavoriteController.getMyFavorites...`); // Remove log
    FavoriteController_1.FavoriteController.getMyFavorites(req, res).catch(next);
});
// GET /api/users/me/posts - 获取当前用户的帖子列表 (Re-apply definition)
userRouter.get('/me/posts', AuthMiddleware_1.AuthMiddleware, (req, res, next) => {
    // console.log('[UserRoutes.ts] Matched /me/posts route definition'); // Remove log
    UserController_1.UserController.getMyPosts(req, res).catch(next);
});
// PUT /api/users/profile - 更新当前用户个人资料 (需要认证)
userRouter.put('/profile', AuthMiddleware_1.AuthMiddleware, UserController_1.UserController.updateProfile);
// 更新当前用户信息 (用于设置预设头像或修改名字等)
userRouter.put('/me/profile', AuthMiddleware_1.AuthMiddleware, UserController_1.UserController.updateUserProfile);
// 上传头像
userRouter.post('/me/avatar', AuthMiddleware_1.AuthMiddleware, multerConfig_1.default.single('avatar'), UserController_1.UserController.uploadAvatar);
// 未来可以在这里添加其他用户相关的路由，例如更新用户信息
// router.put('/profile', AuthMiddleware, UserController.updateProfile);
// --- 获取用户其他关联数据的路由占位符 (未来实现) ---
// userRouter.get('/me/favorites', AuthMiddleware, UserController.getUserFavorites); // <-- 删除或注释掉这个重复的定义
userRouter.get('/me/posts', AuthMiddleware_1.AuthMiddleware, UserController_1.UserController.getUserPosts);
userRouter.get('/me/notifications', AuthMiddleware_1.AuthMiddleware, UserController_1.UserController.getUserNotifications);
//# sourceMappingURL=UserRoutes.js.map