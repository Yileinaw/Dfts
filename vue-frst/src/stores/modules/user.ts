import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
// import { useRouter } from 'vue-router' // 如果 logout 需要跳转，则保留
// 从 types 文件导入共享类型
// import type { UserInfo, LoginCredentials, RegisterInfo } from '@/types/api' // 移除旧的
// 导入 API 调用函数
// import { loginApi, registerApi } from '@/services/modules/auth' // 移除 API 导入，因为 actions 不再调用 API
// 从新的类型文件导入 User
import type { User } from '@/types/models'
import { AuthService } from '@/services/AuthService'
import { UserService } from '@/services/UserService'
import http from '@/http'
import type { LoginResponse } from '@/services/AuthService'

export const useUserStore = defineStore('user', () => {
    // --- State --- 
    // 使用 ref 定义状态属性
    const token = ref(localStorage.getItem('authToken') || null) // 尝试从 localStorage 读取初始 token
    const currentUser = ref<Omit<User, 'password'> | null>(JSON.parse(localStorage.getItem('currentUserInfo') || 'null')) // 尝试读取用户信息，明确 User 类型

    // --- Getters --- 
    // 使用 computed 定义 getters
    const isLoggedIn = computed(() => !!token.value && !!currentUser.value)
    const userName = computed(() => currentUser.value?.name || '游客') // 使用 name 而不是 nickname
    const userAvatar = computed(() => '') // 假设目前 User 模型没有头像字段
    const resolvedAvatarUrl = computed(() => {
        const url = currentUser.value?.avatarUrl;
        console.log('[resolvedAvatarUrl] Current avatarUrl from state:', url);
        
        let urlToResolve: string; // Define urlToResolve outside the blocks
        
        if (!url) {
             const defaultAvatarPath = '/avatars/defaults/1.jpg'; // Fallback to default preset
             console.log(`[resolvedAvatarUrl] URL is null/undefined, falling back to default path: ${defaultAvatarPath}`);
             // Note: Ensure '1.jpg' exists in backend/public/avatars/defaults/
             urlToResolve = defaultAvatarPath; // Assign to the outer variable
        } else {
             urlToResolve = url; // Assign to the outer variable
        }
        
        // Common resolving logic - now urlToResolve is accessible
        if (urlToResolve.startsWith('http://') || urlToResolve.startsWith('https://')) {
            console.log('[resolvedAvatarUrl] URL is absolute:', urlToResolve);
            return urlToResolve;
        }
        const apiBaseUrl = http.defaults.baseURL || '';
        const staticBaseUrl = apiBaseUrl.replace(/\/api\/?$/, '');
        const relativeUrl = urlToResolve.startsWith('/') ? urlToResolve : '/' + urlToResolve;
        const finalUrl = `${staticBaseUrl}${relativeUrl}`;
         console.log('[resolvedAvatarUrl] Resolved final URL:', finalUrl);
        return finalUrl;
    })

    // --- Actions --- 
    // const router = useRouter() // 如果 logout 需要跳转，则保留

    // 辅助函数：设置 Token 和用户信息 (内部使用，保持不变)
    // 将函数名改为内部使用约定 (_)
    function _setLoginInfo(newToken: string | null, userInfo: Omit<User, 'password'> | null) {
        console.log('[_setLoginInfo] Called with token:', newToken, 'User Info:', userInfo);
        const oldAvatar = currentUser.value?.avatarUrl;
        token.value = newToken
        currentUser.value = userInfo
        localStorage.setItem('authToken', newToken || '')
        if (userInfo) {
            localStorage.setItem('currentUserInfo', JSON.stringify(userInfo))
        } else {
            localStorage.removeItem('currentUserInfo')
            // Keep token removal logic here?
            // localStorage.removeItem('authToken') // Maybe only remove token on explicit logout?
        }
        if (newToken) {
            http.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        } else {
            delete http.defaults.headers.common['Authorization'];
        }
        console.log('[_setLoginInfo] Avatar URL changed:', oldAvatar, '->', currentUser.value?.avatarUrl);
    }

    // --- 新增 Action: 设置 Token ---
    function setToken(newToken: string | null) {
        console.log('[setToken] Called with:', newToken);
        // Preserve existing user info when only setting token
        _setLoginInfo(newToken, currentUser.value); 
    }

    // --- 新增 Action: 设置用户信息 ---
    function setUser(userInfo: Omit<User, 'password'> | null) {
        console.log('[setUser] Called with:', userInfo);
        // Preserve existing token when only setting user
        _setLoginInfo(token.value, userInfo);
    }

    // --- 新增 Action: 登录 ---
    async function login(credentials: any): Promise<LoginResponse> {
        console.log('[login] Attempting login...');
        const response = await AuthService.login(credentials);
        console.log('[login] Login API success, token:', response.token);
        // Set token first, then fetch profile which will set the user
        setToken(response.token);
        await fetchUserProfile();
        return response;
    }

    // --- 新增 Action: 获取用户信息 ---
    async function fetchUserProfile() {
        console.log('[fetchUserProfile] Fetching profile...');
        if (!token.value) {
             console.log('[fetchUserProfile] No token, aborting.');
             return;
        }
        try {
            const response = await UserService.getCurrentUserProfile();
            console.log('[fetchUserProfile] API success, received user:', response.user);
            // Use setUser to update state correctly
            setUser(response.user);
        } catch (error) {
            console.error("[fetchUserProfile] Failed:", error);
            logout(); // Logout on failure
        }
    }

    // --- 新增 Action: 更新用户信息 ---
    function updateUserInfo(updatedUser: Partial<Omit<User, 'password'>>) {
        console.log('[updateUserInfo] Updating with:', updatedUser);
        if (currentUser.value) {
             const oldAvatar = currentUser.value.avatarUrl;
            currentUser.value = { ...currentUser.value, ...updatedUser };
            console.log('[updateUserInfo] Avatar URL changed:', oldAvatar, '->', currentUser.value.avatarUrl);
             // Persist merged user info to localStorage
             localStorage.setItem('currentUserInfo', JSON.stringify(currentUser.value));
        } else {
            console.warn("[updateUserInfo] No current user to update.");
        }
    }

    // --- 新增 Action: 更新头像 URL ---
    function updateAvatarUrl(newAvatarUrl: string) {
        console.log('[updateAvatarUrl] Updating avatar URL to:', newAvatarUrl);
        if (currentUser.value) {
             const oldAvatar = currentUser.value.avatarUrl;
            currentUser.value = { ...currentUser.value, avatarUrl: newAvatarUrl };
            console.log('[updateAvatarUrl] Avatar URL changed:', oldAvatar, '->', currentUser.value.avatarUrl);
             // Persist change to localStorage
             localStorage.setItem('currentUserInfo', JSON.stringify(currentUser.value));
        } else {
             console.warn("[updateAvatarUrl] No current user to update.");
        }
    }

    // --- 修改 Action: 登出 ---
    function logout() {
        console.log('[logout] Logging out...');
        _setLoginInfo(null, null);
    }

    // --- Return --- 
    // 暴露 state, getters, 和 actions
    return {
        token,
        currentUser,
        isLoggedIn,
        userName,
        userAvatar,
        resolvedAvatarUrl,
        setToken,
        setUser,
        login,
        fetchUserProfile,
        updateUserInfo,
        updateAvatarUrl,
        logout
    }
}) 