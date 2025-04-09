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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
// src/services/AuthService.ts
const db_1 = __importDefault(require("../db"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// 建议将 JWT 密钥和过期时间放在环境变量中
const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_SUPER_SECRET_KEY'; // 生产环境务必替换并使用环境变量
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d'; // 例如 '1h', '7d'
// 将 expiresIn 转换为秒数以尝试解决类型问题
const getExpiresInSeconds = (expiresInString) => {
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
class AuthService {
    // 用户注册
    static register(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password, name } = userData;
            // 1. 检查邮箱是否已存在
            const existingUser = yield db_1.default.user.findUnique({ where: { email } });
            if (existingUser) {
                throw new Error('Email already exists');
            }
            // 2. 哈希密码
            const hashedPassword = yield bcrypt_1.default.hash(password, 10); // 10 是 salt rounds
            // 3. 创建用户
            const user = yield db_1.default.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                },
            });
            // 4. 返回用户信息（不包含密码）
            const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
            return userWithoutPassword;
        });
    }
    // 用户登录
    static login(credentials) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = credentials;
            // 1. 查找用户
            const user = yield db_1.default.user.findUnique({ where: { email } });
            if (!user) {
                throw new Error('Invalid email or password');
            }
            // 2. 比较密码
            const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                throw new Error('Invalid email or password');
            }
            // 3. 生成 JWT
            const tokenPayload = { userId: user.id, email: user.email };
            const token = jsonwebtoken_1.default.sign(tokenPayload, JWT_SECRET, { expiresIn: expiresInSeconds });
            // 4. 返回 token 和用户信息（不包含密码）
            const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
            return { token, user: userWithoutPassword };
        });
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=AuthService.js.map