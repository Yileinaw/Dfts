import axios from 'axios';
import { useUserStore } from '@/stores/modules/user';
import { ElMessage, ElLoading } from 'element-plus';
import type { LoadingInstance } from 'element-plus/es/components/loading/src/loading';

// Loading instance (example - manage visibility based on requests)
let loadingInstance: LoadingInstance | null = null;
let requestCount = 0;

function showLoading() {
    if (requestCount === 0) {
        loadingInstance = ElLoading.service({
            lock: true,
            text: '加载中...',
            background: 'rgba(0, 0, 0, 0.7)',
        });
    }
    requestCount++;
}

function hideLoading() {
    requestCount--;
    if (requestCount === 0 && loadingInstance) {
        loadingInstance.close();
        loadingInstance = null;
    }
}

// Create Axios instance
const service = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api', // Read from env or default to /api
    timeout: 10000, // Request timeout 10s
});

// Request interceptor
service.interceptors.request.use(
    (config) => {
        showLoading(); // Show loading indicator
        const userStore = useUserStore();
        const token = userStore.token;
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        hideLoading(); // Hide loading on request error
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
service.interceptors.response.use(
    (response) => {
        hideLoading(); // Hide loading on successful response
        const res = response.data;

        // Assuming API returns a structure like { code: number, message: string, data: any }
        // Adjust this logic based on your actual API response structure
        if (res.code !== 0 && res.code !== 200) { // Example: code 0 or 200 means success
            ElMessage({
                message: res.message || 'Error',
                type: 'error',
                duration: 5 * 1000,
            });

            // Handle specific error codes
            if (res.code === 401) { // Example: Unauthorized
                const userStore = useUserStore();
                userStore.logout(); // Trigger logout action (which should redirect)
                // No need to reject here as logout handles the flow
                return Promise.resolve(res); // Or reject if needed based on component handling
            }
            // Add handling for other common error codes (403, 500 etc.)

            return Promise.reject(new Error(res.message || 'Error'));
        } else {
            // Return the actual data part of the response
            return res.data;
        }
    },
    (error) => {
        hideLoading(); // Hide loading on response error
        console.error('Response Error:', error);
        let message = '请求失败，请稍后重试';
        if (error.response) {
            // Handle specific HTTP status codes from the error response
            switch (error.response.status) {
                case 401:
                    message = '认证失败，请重新登录';
                    const userStore = useUserStore();
                    userStore.logout();
                    break;
                case 403:
                    message = '您没有权限执行此操作';
                    break;
                case 404:
                    message = '请求的资源未找到';
                    break;
                case 500:
                case 502:
                case 503:
                case 504:
                    message = '服务器开小差了，请稍后再试';
                    break;
                default:
                    message = error.response.data?.message || error.message || message;
            }
        } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            message = '请求超时，请检查网络连接';
        }
        // Don't show logout message if it was a 401 handled by store
        if (error.response?.status !== 401) {
            ElMessage({
                message: message,
                type: 'error',
                duration: 5 * 1000,
            });
        }
        return Promise.reject(error);
    }
);

export default service; 