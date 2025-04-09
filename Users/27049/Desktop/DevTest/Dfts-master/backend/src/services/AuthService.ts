// src/services/AuthService.ts
import prisma from '../db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

// 建议将 JWT 密钥和过期时间放在环境变量中
const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_SUPER_SECRET_KEY'; // 生产环境务必替换并使用环境变量
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d'; // 例如 '1h', '7d'

// 将 expiresIn 转换为秒数以尝试解决类型问题
const getExpiresInSeconds = (expiresInString: string): number => {
    const unit = expiresInString.charAt(expiresInString.length - 1);
    const value = parseInt(expiresInString.slice(0, -1), 10);
    switch (unit) {
        case 's': return value;
        case 'm': return value * 60;
        case 'h': return value * 60 * 60;
        case 'd': return value * 60 * 60 * 24;
        default: return 60 * 60 * 24; // 默认为 1 天
    }
};
const expiresInSeconds = getExpiresInSeconds(JWT_EXPIRES_IN);

export class AuthService {
    // 用户注册
    public static async register(userData: Pick<User, 'email' | 'password' | 'name'>): Promise<Omit<User, 'password'>> {
        const { email, password, name } = userData;

        // 1. 检查邮箱是否已存在
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new Error('Email already exists');
        }

        // 2. 哈希密码
        const hashedPassword = await bcrypt.hash(password, 10); // 10 是 salt rounds

        // 3. 创建用户
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
        });

        // 4. 返回用户信息（不包含密码）
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    // 用户登录
    public static async login(credentials: Pick<User, 'email' | 'password'>): Promise<{ token: string; user: Omit<User, 'password'> }> {
        const { email, password } = credentials;

        // 1. 查找用户
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new Error('Invalid email or password');
        }

        // 2. 比较密码
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        // 3. 生成 JWT
        const tokenPayload = { userId: user.id, email: user.email };
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: expiresInSeconds });

        // 4. 返回 token 和用户信息（不包含密码）
        const { password: _, ...userWithoutPassword } = user;
        return { token, user: userWithoutPassword };
    }
} 