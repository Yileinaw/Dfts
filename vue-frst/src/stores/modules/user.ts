import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
// import { useRouter } from 'vue-router' // 如果 logout 需要跳转，则保留
// 从 types 文件导入共享类型
// import type { UserInfo, LoginCredentials, RegisterInfo } from '@/types/api' // 移除旧的
// 导入 API 调用函数
// import { loginApi, registerApi } from '@/services/modules/auth' // 移除 API 导入，因为 actions 不再调用 API
// 从新的类型文件导入 User
import type { User } from '@/types/models'

export const useUserStore = defineStore('user', () => {
    // --- State --- 
    // 使用 ref 定义状态属性
    const token = ref(localStorage.getItem('authToken') || '') // 尝试从 localStorage 读取初始 token
    const currentUser = ref<User | null>(JSON.parse(localStorage.getItem('currentUserInfo') || 'null')) // 尝试读取用户信息，明确 User 类型

    // --- Getters --- 
    // 使用 computed 定义 getters
    const isLoggedIn = computed(() => !!token.value)
    const userName = computed(() => currentUser.value?.name || '游客') // 使用 name 而不是 nickname
    const userAvatar = computed(() => '') // 假设目前 User 模型没有头像字段

    // --- Actions --- 
    // const router = useRouter() // 如果 logout 需要跳转，则保留

    // 辅助函数：设置 Token 和用户信息 (内部使用，保持不变)
    // 将函数名改为内部使用约定 (_)
    function _setLoginInfo(newToken: string, userInfo: User | null) {
        token.value = newToken
        currentUser.value = userInfo
        localStorage.setItem('authToken', newToken)
        if (userInfo) {
            localStorage.setItem('currentUserInfo', JSON.stringify(userInfo))
        } else {
            localStorage.removeItem('currentUserInfo')
            localStorage.removeItem('authToken') // 登出时也移除 token
        }
    }

    // --- 新增 Action: 设置 Token ---
    function setToken(newToken: string) {
        // 仅设置 token，用户信息可能稍后或分开设置
        token.value = newToken
        localStorage.setItem('authToken', newToken)
        // 注意：这里不清除用户信息，因为可能只是刷新 token
    }

    // --- 新增 Action: 设置用户信息 ---
    function setUser(userInfo: User | null) {
        currentUser.value = userInfo
        if (userInfo) {
            localStorage.setItem('currentUserInfo', JSON.stringify(userInfo))
        } else {
            localStorage.removeItem('currentUserInfo')
        }
    }

    // --- 修改 Action: 登出 ---
    function logout() {
        _setLoginInfo('', null) // 调用内部函数彻底清除
        console.log('User logged out')
        // 可以在这里添加跳转逻辑，例如 router.push('/login')
    }

    // --- Return --- 
    // 暴露 state, getters, 和 actions
    return {
        token,
        currentUser,
        isLoggedIn,
        userName,
        userAvatar,
        // 移除 setLoginInfo, clearLoginInfo, login, register
        setToken, // 暴露新的 action
        setUser,  // 暴露新的 action
        logout
    }
}) 