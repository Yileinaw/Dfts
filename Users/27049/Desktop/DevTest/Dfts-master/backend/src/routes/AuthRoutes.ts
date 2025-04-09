import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const router = Router();

// 定义认证路由
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

export default router; 