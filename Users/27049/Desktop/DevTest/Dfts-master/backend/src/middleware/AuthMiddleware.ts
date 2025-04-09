// src/middleware/AuthMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../db'; // 引入 Prisma Client

// 从环境变量获取 JWT 密钥，与 AuthService 保持一致
const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_SUPER_SECRET_KEY';

// 定义一个接口来扩展 Express 的 Request 类型，以包含 userId
// 添加 export 使其可以被其他模块导入
export interface AuthenticatedRequest extends Request {
    userId?: number; // 将 userId 设为可选，因为并非所有请求都需要它
}

export const AuthMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    // 1. 获取 Authorization header
    const authHeader = req.headers.authorization;

    // 2. 检查 Header 是否存在且格式正确 (Bearer <token>)
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Unauthorized: Missing or invalid token format' });
        return;
    }

    // 3. 提取 Token
    const token = authHeader.split(' ')[1];

    try {
        // 4. 验证 Token
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string; iat: number; exp: number };

        // 5. (可选但推荐) 检查用户是否存在于数据库中
        // 这可以防止已删除用户但 Token 尚未过期的访问
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });

        if (!user) {
            res.status(401).json({ message: 'Unauthorized: User not found' });
            return;
        }


        // 6. 将解码出的 userId 附加到请求对象上
        req.userId = decoded.userId;

        // 7. 调用 next() 将控制权传递给下一个中间件或路由处理程序
        next();
    } catch (error: any) {
        // Token 验证失败 (例如过期、签名无效等)
        console.error('Auth Middleware Error:', error.message);
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({ message: 'Unauthorized: Token expired' });
        } else if (error.name === 'JsonWebTokenError') {
            res.status(401).json({ message: 'Unauthorized: Invalid token' });
        } else {
            res.status(401).json({ message: 'Unauthorized' });
        }
    }
}; 