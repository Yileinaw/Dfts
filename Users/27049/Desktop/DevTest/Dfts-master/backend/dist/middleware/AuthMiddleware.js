"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../db")); // 引入 Prisma Client
// 从环境变量获取 JWT 密钥，与 AuthService 保持一致
const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_SUPER_SECRET_KEY';
const AuthMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // 5. (可选但推荐) 检查用户是否存在于数据库中
        // 这可以防止已删除用户但 Token 尚未过期的访问
        const user = yield db_1.default.user.findUnique({
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
    }
    catch (error) {
        // Token 验证失败 (例如过期、签名无效等)
        console.error('Auth Middleware Error:', error.message);
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({ message: 'Unauthorized: Token expired' });
        }
        else if (error.name === 'JsonWebTokenError') {
            res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }
        else {
            res.status(401).json({ message: 'Unauthorized' });
        }
    }
});
exports.AuthMiddleware = AuthMiddleware;
//# sourceMappingURL=AuthMiddleware.js.map