// Placeholder for API related type definitions

// User Info Type
export interface UserInfo {
    id: string;
    nickname: string;
    email: string;
    avatarUrl?: string;
}

// Login Credentials Type
export interface LoginCredentials {
    email: string;
    password?: string;
}

// Register Info Type
export interface RegisterInfo {
    nickname: string;
    email: string;
    password?: string;
}

// API Response Wrapper Type
export interface ApiResponse<T = any> {
    code: number; // 0 for success, other for error
    message: string;
    data: T;
} 