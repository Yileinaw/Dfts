import request from '../request'
import type { LoginCredentials, RegisterInfo } from '@/types/api'
import type { UserInfo } from '@/stores/modules/user' // Re-use UserInfo type from store or define separately in api.ts

// --- Authentication APIs ---

// Login API call
export function loginApi(data: LoginCredentials): Promise<UserInfo> { // Example: Assuming API returns UserInfo on login
    return request({
        url: '/auth/login', // Replace with your actual login endpoint
        method: 'post',
        data
    })
}

// Register API call
export function registerApi(data: RegisterInfo): Promise<any> { // Example: Assuming register returns simple success/fail
    return request({
        url: '/auth/register', // Replace with your actual register endpoint
        method: 'post',
        data
    })
}

// (Optional) Get current user info API call (if needed separately)
export function getCurrentUserApi(): Promise<UserInfo> {
    return request({
        url: '/user/me', // Replace with your actual endpoint
        method: 'get'
    })
} 