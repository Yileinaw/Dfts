import { Response } from 'express';
import { UserService } from '../services/UserService';
import { AuthenticatedRequest } from '../middleware/AuthMiddleware'; // 导入扩展后的 Request 类型

export class UserController {
    // 处理获取当前登录用户信息的请求
    public static async getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            // 从认证中间件获取 userId (如果中间件验证成功，userId 一定存在)
            const userId = req.userId;

            if (!userId) {
                // 理论上如果认证中间件正确执行，这里不会发生
                res.status(401).json({ message: 'Unauthorized: User ID not found after authentication' });
                return;
            }

            const user = await UserService.getUserById(userId);

            if (!user) {
                // 理论上如果认证中间件的数据库检查有效，这里也不会发生
                res.status(404).json({ message: 'User not found' });
                return;
            }

            res.status(200).json({ user });
        } catch (error: any) {
            console.error('Get Current User Error:', error);
            res.status(500).json({ message: 'Internal server error retrieving user data' });
        }
    }

    // 处理更新用户个人资料的请求
    public static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId;
            const { name /* 其他允许更新的字段 */ } = req.body;

            if (!userId) {
                res.status(401).json({ message: 'Unauthorized: User ID not found' });
                return;
            }

            // 验证输入，确保至少提供了一个有效字段
            if (name === undefined /* && 其他字段 === undefined */) {
                res.status(400).json({ message: 'No valid profile data provided for update (e.g., name)' });
                return;
            }

            const updatedUser = await UserService.updateUserProfile(userId, { name /* 其他字段 */ });

            res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
        } catch (error: any) {
            console.error('Update Profile Error:', error);
            if (error.message === "No profile data provided for update" || error.message === "Failed to update user profile") {
                res.status(400).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'Internal server error updating profile' });
            }
        }
    }

    // 未来可以在这里添加更新用户等控制器方法
} 