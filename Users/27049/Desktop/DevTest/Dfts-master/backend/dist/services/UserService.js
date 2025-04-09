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
exports.UserService = void 0;
const db_1 = __importDefault(require("../db"));
class UserService {
    // 根据 ID 获取用户信息（不包含密码）
    static getUserById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield db_1.default.user.findUnique({
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
        });
    }
    // 更新用户个人资料
    static updateUserProfile(userId, profileData) {
        return __awaiter(this, void 0, void 0, function* () {
            // 确保至少有一个字段被提供用于更新
            if (Object.keys(profileData).length === 0) {
                // 或者可以返回当前用户信息，表示没有更改
                throw new Error("No profile data provided for update");
            }
            try {
                const updatedUser = yield db_1.default.user.update({
                    where: { id: userId },
                    data: {
                        name: profileData.name,
                        // 在这里添加其他允许更新的字段
                    },
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        createdAt: true,
                        updatedAt: true,
                    }
                });
                return updatedUser;
            }
            catch (error) {
                // 处理可能的错误，例如 Prisma 的唯一约束冲突 (虽然这里更新 name 不太可能)
                console.error("Update User Profile Error:", error);
                // 可以根据 error.code (如 P2002 表示唯一约束失败) 进行特定处理
                throw new Error("Failed to update user profile");
            }
        });
    }
}
exports.UserService = UserService;
//# sourceMappingURL=UserService.js.map