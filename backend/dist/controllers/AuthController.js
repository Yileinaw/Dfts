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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const AuthService_1 = require("../services/AuthService");
class AuthController {
    // 处理用户注册请求
    static register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password, name } = req.body;
                // 基本输入验证
                if (!email || !password) {
                    res.status(400).json({ message: 'Email and password are required' });
                    return;
                }
                // 可以在这里添加更复杂的验证逻辑（例如使用 zod）
                const user = yield AuthService_1.AuthService.register({ email, password, name });
                res.status(201).json({ message: 'User registered successfully', user });
            }
            catch (error) {
                // 根据错误类型返回不同的状态码
                if (error.message === 'Email already exists') {
                    res.status(409).json({ message: error.message }); // 409 Conflict
                }
                else {
                    console.error('Registration Error:', error);
                    res.status(500).json({ message: 'Internal server error during registration' });
                }
            }
        });
    }
    // 处理用户登录请求
    static login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                // 基本输入验证
                if (!email || !password) {
                    res.status(400).json({ message: 'Email and password are required' });
                    return;
                }
                const { token, user } = yield AuthService_1.AuthService.login({ email, password });
                res.status(200).json({ message: 'Login successful', token, user });
            }
            catch (error) {
                // 根据错误类型返回不同的状态码
                if (error.message === 'Invalid email or password') {
                    res.status(401).json({ message: error.message }); // 401 Unauthorized
                }
                else {
                    console.error('Login Error:', error);
                    res.status(500).json({ message: 'Internal server error during login' });
                }
            }
        });
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map