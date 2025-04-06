import { get, post } from '@/utils/request';
import type { ApiResponse, LoginResponse, UserInfo } from '@/types/api';

// 定义登录请求的数据类型 (根据实际后端接口调整)
interface LoginPayload {
    username?: string; // 用户名或邮箱或手机号
    password?: string;
    captcha?: string; // 图形验证码
    smsCode?: string; // 短信验证码
    loginType: 'password' | 'sms'; // 登录方式
}

// 定义注册请求的数据类型
interface RegisterPayload {
    username: string;
    password?: string;
    email?: string;
    phone?: string;
    smsCode: string; // 注册通常需要短信验证码
    inviteCode?: string; // 邀请码 (可选)
}

// 定义获取短信验证码的请求类型
interface SmsCodePayload {
    phone?: string;
    email?: string;
    type: 'login' | 'register' | 'resetPassword'; // 验证码类型
}

/**
 * 密码登录
 * @param data 登录信息
 */
export function loginByPassword(data: LoginPayload): Promise<ApiResponse<LoginResponse>> {
    // 确保只传递密码登录所需字段
    const payload: Partial<LoginPayload> = {
        username: data.username,
        password: data.password,
        captcha: data.captcha,
        loginType: 'password',
    };
    return post<LoginResponse>('/auth/login/password', payload); // URL 根据后端实际接口调整
}

/**
 * 短信验证码登录
 * @param data 登录信息
 */
export function loginBySms(data: LoginPayload): Promise<ApiResponse<LoginResponse>> {
    const payload: Partial<LoginPayload> = {
        username: data.username, // 通常是手机号
        smsCode: data.smsCode,
        loginType: 'sms',
    };
    return post<LoginResponse>('/auth/login/sms', payload); // URL 根据后端实际接口调整
}

/**
 * 用户注册
 * @param data 注册信息
 */
export function register(data: RegisterPayload): Promise<ApiResponse<null>> { // 注册成功通常不返回特定数据，用 null
    return post<null>('/auth/register', data); // URL 根据后端实际接口调整
}

/**
 * 获取短信验证码
 * @param data 手机号/邮箱和类型
 */
export function getSmsCode(data: SmsCodePayload): Promise<ApiResponse<null>> {
    return post<null>('/auth/sms-code', data); // URL 根据后端实际接口调整
}

/**
 * 获取当前登录用户信息
 * 通常在 Token 有效的情况下调用
 */
export function getCurrentUserInfo(): Promise<ApiResponse<UserInfo>> {
    return get<UserInfo>('/user/profile'); // URL 根据后端实际接口调整
}

/**
 * 登出
 * 后端可能需要一个接口来使 Token 失效
 */
export function logout(): Promise<ApiResponse<null>> {
    return post<null>('/auth/logout'); // URL 根据后端实际接口调整
} 