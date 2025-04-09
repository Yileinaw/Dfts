import http from '../http'; // 导入配置好的 Axios 实例
import type { User } from '../types/models';

// 定义注册请求的数据类型 (根据后端需要)
interface RegisterData {
    email: string;
    password?: string; // 注册时密码通常是必须的
    name?: string;
}

// 定义登录请求的数据类型
interface LoginData {
    email: string;
    password?: string; // 登录时密码通常是必须的
}

// 定义登录响应的数据类型 (根据后端返回)
export interface LoginResponse {
    message: string;
    token: string;
    user: Omit<User, 'password'>; // 假设后端返回不含密码的用户信息
}

// 定义注册响应的数据类型
interface RegisterResponse {
    message: string;
    user: Omit<User, 'password'>;
}


export const AuthService = {
    async register(data: RegisterData): Promise<RegisterResponse> {
        // 注意：Axios 返回的数据在 response.data 中
        const response = await http.post<RegisterResponse>('/auth/register', data);
        return response.data;
    },

    async login(data: LoginData): Promise<LoginResponse> {
        const response = await http.post<LoginResponse>('/auth/login', data);
        return response.data;
    },

    // 获取当前用户信息 (使用 GET 请求，需要认证)
    async getCurrentUser(): Promise<{ user: Omit<User, 'password'> }> {
        const response = await http.get<{ user: Omit<User, 'password'> }>('/users/me');
        return response.data;
    }
}; 