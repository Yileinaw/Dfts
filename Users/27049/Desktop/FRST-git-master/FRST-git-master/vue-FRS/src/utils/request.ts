import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse, LoginResponse } from '@/types/api';
import { useAuthStore } from '@/store/modules/auth';
import { ElMessage, ElMessageBox } from 'element-plus'; // 引入 Element Plus 提示组件

const instance: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000, // 请求超时时间
});

// 请求拦截器
instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // 在发送请求之前做些什么, 例如添加 token
        const authStore = useAuthStore();
        const token = authStore.getToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        // 对请求错误做些什么
        console.error('[Request Error]:', error);
        return Promise.reject(error);
    }
);

// 响应拦截器
instance.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
        const res = response.data;

        // 如果 code 不为 0 (假设 0 为成功状态码), 则判断为错误
        if (res.code !== 0) {
            ElMessage({
                message: res.message || 'Error', // 优先使用后端返回的错误信息
                type: 'error',
                duration: 5 * 1000,
            });

            // 特殊处理常见的错误 code (例如 401 未授权)
            if (res.code === 401) {
                // 可以触发重新登录的逻辑
                const authStore = useAuthStore();
                // 防止重复弹出确认框
                if (!document.querySelector('.el-message-box__wrapper')) {
                    ElMessageBox.confirm(
                        '登录状态已过期，您可以取消停留在此页面，或重新登录',
                        '确认登出',
                        {
                            confirmButtonText: '重新登录',
                            cancelButtonText: '取消',
                            type: 'warning',
                        }
                    ).then(() => {
                        authStore.clearAuth();
                        window.location.href = '/auth/login'; // 跳转登录页
                    }).catch(() => {
                        // 用户点击取消或其他错误
                        console.log('User cancelled re-login or error occurred');
                    });
                }
            }

            // 返回一个包含错误信息的 rejected Promise
            return Promise.reject(new Error(res.message || 'Error'));
        }
        // 如果 code 为 0，表示业务成功，返回完整的 ApiResponse 对象
        // 或者根据需要，可以只返回 res.data
        return response; // 返回原始 response，让 request 函数处理
    },
    error => {
        // 对响应错误做点什么 (例如网络错误，超时等)
        console.error('[Response Error]:', error);
        ElMessage({
            message: error.message || '网络错误，请稍后重试',
            type: 'error',
            duration: 5 * 1000,
        });
        return Promise.reject(error);
    }
);

// 封装请求方法，处理类型问题
const request = <T = any>(
    config: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
    return new Promise((resolve, reject) => {
        instance.request<ApiResponse<T>>(config)
            .then((response: AxiosResponse<ApiResponse<T>>) => {
                // 拦截器已经处理了业务错误，这里直接 resolve ApiResponse
                resolve(response.data);
            })
            .catch(error => {
                // 拦截器处理过的业务错误或网络错误会在这里被捕获
                reject(error);
            });
    });
};

// 封装 GET, POST 等方法
export const get = <T = any>(
    url: string,
    params?: object,
    config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
    return request<T>({ ...config, url, method: 'GET', params });
};

export const post = <T = any>(
    url: string,
    data?: object,
    config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
    return request<T>({ ...config, url, method: 'POST', data });
};

export const put = <T = any>(
    url: string,
    data?: object,
    config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
    return request<T>({ ...config, url, method: 'PUT', data });
};

export const del = <T = any>(
    url: string,
    params?: object, // DELETE 请求通常通过 params 或 url 传递参数
    config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
    return request<T>({ ...config, url, method: 'DELETE', params });
};

export default request; // 也可以直接导出封装好的方法，而不是实例 