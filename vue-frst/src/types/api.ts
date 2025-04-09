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

// Generic Paginated Response structure
export interface PaginatedResponse {
    totalCount: number;
    // Assuming the actual data array key might vary (e.g., 'posts', 'comments', 'notifications')
    // The specific service methods will extend this interface with the correct data key and type.
}

// API Response Wrapper Type (assuming your backend doesn't wrap paginated responses in a 'data' field)
// If it DOES wrap, adjust accordingly.
export interface ApiResponse<T = any> {
    code: number; // 0 for success, other for error
    message: string;
    data: T;
} 