import { get, post, put } from '@/utils/request'; // 假设 request.ts 中导出了 put 方法
import type {
    ApiResponse,
    UserInfo,
    UpdateProfilePayload,
    ChangePasswordPayload,
    BindPayload,
} from '@/types/api';

/**
 * 获取当前登录用户的详细信息 (复用 auth.ts 中的方法可能更好，或者在这里重新定义)
 */
export function getUserProfile(): Promise<ApiResponse<UserInfo>> {
    return get<UserInfo>('/user/profile'); // URL 根据后端实际接口调整
}

/**
 * 更新当前登录用户的资料
 * @param data 用户资料 (部分更新)
 */
export function updateUserProfile(data: UpdateProfilePayload): Promise<ApiResponse<UserInfo>> {
    // 使用 PUT 或 PATCH 方法更符合 RESTful 风格
    return put<UserInfo>('/user/profile', data); // 假设使用 PUT，URL 根据后端实际接口调整
}

/**
 * 修改密码
 * @param data 密码信息
 */
export function changePassword(data: ChangePasswordPayload): Promise<ApiResponse<null>> {
    // 提交给后端时通常不需要 confirmPassword
    const { confirmPassword, ...payload } = data;
    return post<null>('/user/password', payload); // URL 根据后端实际接口调整
}

/**
 * 上传头像
 * 通常返回新的头像 URL
 * @param file 文件对象
 */
export function uploadAvatar(file: File): Promise<ApiResponse<{ avatarUrl: string }>> {
    const formData = new FormData();
    formData.append('avatar', file); // 后端接收的文件字段名可能不同

    return post<{ avatarUrl: string }>('/user/avatar', formData, {
        headers: {
            'Content-Type': 'multipart/form-data', // 设置正确的请求头
        },
    }); // URL 根据后端实际接口调整
}

/**
 * 绑定邮箱
 * @param data 邮箱和验证码
 */
export function bindEmail(data: BindPayload): Promise<ApiResponse<null>> {
    return post<null>('/user/bind/email', data); // URL 根据后端实际接口调整
}

/**
 * 解绑邮箱 (如果允许)
 * 可能需要验证码或密码确认
 */
// export function unbindEmail(data: UnbindPayload): Promise<ApiResponse<null>> { ... }

/**
 * 绑定手机号
 * @param data 手机号和验证码
 */
export function bindPhone(data: BindPayload): Promise<ApiResponse<null>> {
    return post<null>('/user/bind/phone', data); // URL 根据后端实际接口调整
}

/**
 * 解绑手机号 (如果允许)
 */
// export function unbindPhone(data: UnbindPayload): Promise<ApiResponse<null>> { ... }

/**
 * 注销账号 (危险操作)
 * 可能需要密码或验证码确认
 */
// export function deleteAccount(data: DeleteAccountPayload): Promise<ApiResponse<null>> { ... } 