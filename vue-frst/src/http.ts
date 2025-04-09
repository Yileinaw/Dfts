import axios from 'axios';

// 创建 Axios 实例
const http = axios.create({
    baseURL: 'http://localhost:3001/api', // 后端 API 的基础 URL
    timeout: 10000, // 请求超时时间 (10秒)
});

// 请求拦截器
http.interceptors.request.use(
    (config) => {
        // 尝试从 localStorage (或其他地方) 获取 Token
        // (我们稍后会使用 Pinia 存储 Token，这里先用 localStorage 示例)
        const token = localStorage.getItem('authToken'); // 假设 Token 存储在 localStorage

        // 如果 Token 存在，则添加到请求头
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        // 处理请求错误
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// 响应拦截器 (可选，但推荐用于统一错误处理)
http.interceptors.response.use(
    (response) => {
        // 对响应数据做点什么
        return response;
    },
    (error) => {
        // 处理响应错误
        console.error('Response interceptor error:', error.response || error.message);

        // 可以在这里添加全局错误处理逻辑，例如：
        // - 如果是 401 Unauthorized (Token 失效)，则跳转到登录页
        if (error.response && error.response.status === 401) {
            console.error('Unauthorized access - possibly invalid token.');
            // 清除旧 Token (如果 Token 失效)
            localStorage.removeItem('authToken'); // 同样，稍后用 Pinia 处理
            // 跳转到登录页 (需要引入 Vue Router 实例)
            // router.push('/login');
        }

        return Promise.reject(error);
    }
);

export default http; 