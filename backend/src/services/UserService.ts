import prisma from '../db';
import { User } from '@prisma/client';
import { Prisma } from '@prisma/client';

export class UserService {
    // 根据 ID 获取用户信息（不包含密码）
    public static async getUserById(userId: number): Promise<Omit<User, 'password'> | null> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
                createdAt: true,
                updatedAt: true,
            }
        });
        return user;
    }

    // 更新用户个人资料
    public static async updateUserProfile(
        userId: number, 
        profileData: { name?: string; avatarUrl?: string | null }
    ): Promise<Omit<User, 'password'> | null> {
        console.log(`[UserService.updateUserProfile] User ${userId} updating profile with:`, profileData);
        
        const dataToUpdate: Prisma.UserUpdateInput = {};
        if (profileData.name !== undefined) { dataToUpdate.name = profileData.name; }
        if (profileData.avatarUrl !== undefined) { dataToUpdate.avatarUrl = profileData.avatarUrl; }

        if (Object.keys(dataToUpdate).length === 0) {
             console.log(`[UserService.updateUserProfile] No data provided for user ${userId}, returning current profile.`);
             return await this.getUserById(userId);
        }

        try {
            console.log(`[UserService.updateUserProfile] Updating user ${userId} in DB with:`, dataToUpdate);
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: dataToUpdate,
                select: { 
                    id: true, email: true, name: true,
                    avatarUrl: true, // Ensure avatarUrl is selected back
                    createdAt: true, updatedAt: true,
                }
            });
            console.log(`[UserService.updateUserProfile] User ${userId} updated successfully. New avatarUrl:`, updatedUser.avatarUrl);
            return updatedUser;
        } catch (error: any) {
            console.error(`[UserService.updateUserProfile] Error updating user ${userId}:`, error);
            throw new Error("Failed to update user profile");
        }
    }

    // 未来可以在这里添加更新用户资料等方法
} 