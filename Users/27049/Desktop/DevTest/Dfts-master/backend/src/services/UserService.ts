import prisma from '../db';
import { User } from '@prisma/client';

export class UserService {
    // 根据 ID 获取用户信息（不包含密码）
    public static async getUserById(userId: number): Promise<Omit<User, 'password'> | null> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            // 使用 select 或 exclude 来排除 password 字段
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                updatedAt: true,
                // 在这里添加其他需要返回的字段
            }
            // 或者使用 exclude: { password: true }，但 select 更明确
        });
        return user;
    }

    // 更新用户个人资料
    public static async updateUserProfile(userId: number, profileData: { name?: string /* 可以添加其他允许更新的字段, e.g., avatarUrl?: string */ }): Promise<Omit<User, 'password'> | null> {
        // 确保至少有一个字段被提供用于更新
        if (Object.keys(profileData).length === 0) {
            // 或者可以返回当前用户信息，表示没有更改
            throw new Error("No profile data provided for update");
        }

        try {
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    name: profileData.name,
                    // 在这里添加其他允许更新的字段
                },
                select: { // 同样，只选择需要返回的字段
                    id: true,
                    email: true,
                    name: true,
                    createdAt: true,
                    updatedAt: true,
                }
            });
            return updatedUser;
        } catch (error: any) {
            // 处理可能的错误，例如 Prisma 的唯一约束冲突 (虽然这里更新 name 不太可能)
            console.error("Update User Profile Error:", error);
            // 可以根据 error.code (如 P2002 表示唯一约束失败) 进行特定处理
            throw new Error("Failed to update user profile");
        }
    }

    // 未来可以在这里添加更新用户资料等方法
} 