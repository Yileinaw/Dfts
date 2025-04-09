import { Response } from 'express';
import { UserService } from '../services/UserService';
import { AuthenticatedRequest } from '../middleware/AuthMiddleware'; // 导入扩展后的 Request 类型
import { PostService } from '../services/PostService';
import { FavoriteService } from '../services/FavoriteService';
import { NotificationService } from '../services/NotificationService';
import multer from 'multer';

export class UserController {
    // 处理获取当前登录用户信息的请求
    public static async getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
        // console.log('[UserController] Reached getCurrentUser handler'); // Remove log
        try {
            const userId = req.userId;
            // console.log(`[UserController - getCurrentUser] userId: ${userId}`); // Remove log
            if (!userId) {
                console.error('[UserController - getCurrentUser] Error: userId is missing');
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
            console.error('Get Current User Error:', error); // Keep error log
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

    // --- Add method to get current user's posts --- 
    public static async getMyPosts(req: AuthenticatedRequest, res: Response): Promise<void> {
        // console.log('[UserController] Reached getMyPosts handler'); // Remove log
        try {
            const userId = req.userId;
            // console.log(`[UserController] userId: ${userId}`); // Remove log
            if (!userId) {
                console.error('[UserController] Error: userId is missing after AuthMiddleware');
                res.status(401).json({ message: 'Unauthorized: User ID not found' });
                return;
            }
            
            const page = parseInt(req.query.page as string) || 1; 
            const limit = parseInt(req.query.limit as string) || 10; 
            // console.log(`[UserController] Fetching posts for user ${userId}, page: ${page}, limit: ${limit}`); // Remove log

            // Call PostService.getAllPosts with authorId filter
            const result = await PostService.getAllPosts({ 
                page,
                limit, 
                authorId: userId,
                currentUserId: userId 
             });
            // console.log(`[UserController] PostService returned ${result.posts.length} posts, totalCount: ${result.totalCount}`); // Remove log

            res.status(200).json(result); 

        } catch (error: any) {
            console.error('[UserController] Get My Posts Error:', error); // Keep error log
            res.status(500).json({ message: 'Internal server error retrieving your posts' });
        }
    }
    // --- End add method ---

    // 获取当前登录用户的信息
    public static async getCurrentUserProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId;
            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            const user = await UserService.getUserById(userId);
            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            res.status(200).json({ user });
        } catch (error: any) {
            console.error("Get Current User Profile Error:", error);
            res.status(500).json({ message: error.message || 'Failed to get user profile' });
        }
    }
    
    // 更新用户信息（包括设置预设头像）
     public static async updateUserProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
             const userId = req.userId;
             const { name, avatarUrl } = req.body; // 接收 name 和 avatarUrl

             if (!userId) {
                 res.status(401).json({ message: 'Unauthorized' });
                 return;
             }
             
             // 构建要更新的数据
             const profileData: { name?: string; avatarUrl?: string | null } = {}; // Allow null for removing avatar
             if (name !== undefined) profileData.name = name;
             
             // 验证 avatarUrl 是否是合法的预设路径或为空 (不允许通过此接口设置上传路径)
             if (avatarUrl !== undefined) {
                 if (avatarUrl === null || (typeof avatarUrl === 'string' && avatarUrl.startsWith('/avatars/defaults/'))) {
                    profileData.avatarUrl = avatarUrl;
                 } else {
                    res.status(400).json({ message: 'Invalid avatar URL for profile update' });
                    return;
                 }
             }

             if (Object.keys(profileData).length === 0) {
                res.status(400).json({ message: 'No data provided for update' });
                return;
             }

             const updatedUser = await UserService.updateUserProfile(userId, profileData);
             res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });

         } catch (error: any) {
             console.error("Update User Profile Error:", error);
             res.status(500).json({ message: error.message || 'Failed to update user profile' });
         }
     }

    // 处理头像上传
    public static async uploadAvatar(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId;
            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            if (!req.file) {
                res.status(400).json({ message: 'No file uploaded' });
                return;
            }

            // 构建存储在数据库中的 URL 路径
            const avatarPath = `/uploads/avatars/${req.file.filename}`; 

            // 调用 UserService 更新数据库中的 avatarUrl
            const updatedUser = await UserService.updateUserProfile(userId, { avatarUrl: avatarPath });

            res.status(200).json({ 
                message: 'Avatar uploaded successfully', 
                avatarUrl: avatarPath, 
                user: updatedUser
            });

        } catch (error: any) {
            console.error("Upload Avatar Error:", error);
             // Multer 错误处理 (例如文件过大)
            if (error instanceof multer.MulterError) {
                 res.status(400).json({ message: `Upload error: ${error.message}` });
            } else if (error.message === '只允许上传图片文件!') {
                 res.status(400).json({ message: error.message });
            }
            else {
                res.status(500).json({ message: error.message || 'Failed to upload avatar' });
            }
        }
    }

    // --- Controller methods for user's associated data ---
    public static async getUserFavorites(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId;
            if (!userId) {
                 res.status(401).json({ message: 'Unauthorized' });
                 return;
            }
            const page = parseInt(req.query.page as string) || 1; 
            const limit = parseInt(req.query.limit as string) || 10; 
            // Corrected method name - Call the new service method
            // const favoritesData = await FavoriteService.getFavoritePostsByUserId(userId, { page, limit }); // Old call
            const favoritesData = await FavoriteService.fetchUserFavoritesPage(userId, { page, limit }); // <-- New call
            res.status(200).json(favoritesData);
        } catch (error: any) {
            console.error("Get User Favorites Error:", error);
            res.status(500).json({ message: error.message || 'Failed to get favorites' });
        }
    }

    public static async getUserPosts(req: AuthenticatedRequest, res: Response): Promise<void> {
         try {
             const userId = req.userId;
             if (!userId) {
                 res.status(401).json({ message: 'Unauthorized' });
                 return;
             }
             const page = parseInt(req.query.page as string) || 1; 
             const limit = parseInt(req.query.limit as string) || 10; 
             // Use getAllPosts with authorId filter
             const postsData = await PostService.getAllPosts({ 
                 page,
                 limit, 
                 authorId: userId, // Filter by the logged-in user
                 currentUserId: userId // Ensure isLiked/isFavorited is relative to the user
              });
             res.status(200).json(postsData); // Return the paginated response directly
         } catch (error: any) {
             console.error("Get User Posts Error:", error);
             res.status(500).json({ message: error.message || 'Failed to get posts' });
         }
     }

    public static async getUserNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
             const userId = req.userId;
             if (!userId) {
                 res.status(401).json({ message: 'Unauthorized' });
                 return;
             }
             const page = parseInt(req.query.page as string) || 1; 
             const limit = parseInt(req.query.limit as string) || 10; 
             // Corrected method name and pass options
             const notificationsData = await NotificationService.getNotifications(userId, { page, limit }); 
             res.status(200).json(notificationsData); // Return the paginated response directly
        } catch (error: any) {
            console.error("Get User Notifications Error:", error);
            res.status(500).json({ message: error.message || 'Failed to get notifications' });
        }
    }
    // --- End methods ---

    // 未来可以在这里添加更新用户等控制器方法
} 