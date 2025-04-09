// src/controllers/AuthController.ts
import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

export class AuthController {
    // 处理用户注册请求
    public static async register(req: Request, res: Response): Promise<void> {
        try {
            const { email, password, name } = req.body;

            // 基本输入验证
            if (!email || !password) {
                res.status(400).json({ message: 'Email and password are required' });
                return;
            }
            // 可以在这里添加更复杂的验证逻辑（例如使用 zod）

            const user = await AuthService.register({ email, password, name });
            res.status(201).json({ message: 'User registered successfully', user });
        } catch (error: any) {
            // 根据错误类型返回不同的状态码
            if (error.message === 'Email already exists') {
                res.status(409).json({ message: error.message }); // 409 Conflict
            } else {
                console.error('Registration Error:', error);
                res.status(500).json({ message: 'Internal server error during registration' });
            }
        }
    }

    // 处理用户登录请求
    public static async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            // 基本输入验证
            if (!email || !password) {
                res.status(400).json({ message: 'Email and password are required' });
                return;
            }

            const { token, user } = await AuthService.login({ email, password });
            res.status(200).json({ message: 'Login successful', token, user });
        } catch (error: any) {
            // 根据错误类型返回不同的状态码
            if (error.message === 'Invalid email or password') {
                res.status(401).json({ message: error.message }); // 401 Unauthorized
            } else {
                console.error('Login Error:', error);
                res.status(500).json({ message: 'Internal server error during login' });
            }
        }
    }
} 