import { defineStore } from 'pinia';
import { ref } from 'vue';

// 使用 setup store 风格定义 auth store
export const useAuthStore = defineStore('auth', () => {
    const token = ref<string | null>(localStorage.getItem('authToken')); // 从 localStorage 初始化 token
    const isLoggedIn = ref<boolean>(!!token.value); // 根据 token 判断初始登录状态

    // Action: 设置 token 并更新登录状态
    function setToken(newToken: string | null) {
        token.value = newToken;
        isLoggedIn.value = !!newToken;
        if (newToken) {
            localStorage.setItem('authToken', newToken);
        } else {
            localStorage.removeItem('authToken');
        }
    }

    // Action: 清除 token (登出)
    function clearAuth() {
        setToken(null);
        // 这里可以考虑同时清除用户信息 Store
        // const userStore = useUserStore();
        // userStore.clearUser();
    }

    // Getter: 获取 token (虽然可以直接访问 token.value，但 getter 可以提供更统一的接口)
    const getToken = (): string | null => {
        return token.value;
    };

    return {
        token,
        isLoggedIn,
        setToken,
        clearAuth,
        getToken,
    };
}); 