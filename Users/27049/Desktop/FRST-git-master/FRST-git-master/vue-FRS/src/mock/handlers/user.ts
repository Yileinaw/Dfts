import type { UserInfo } from '@/types/api';
import Mock from 'mockjs';

// Assume userStore interaction happens elsewhere (e.g., in the store action itself)
// These mocks just simulate the API response part.

export default [
    // Update User Profile (Username)
    {
        url: '/api/user/profile',
        type: 'put', // Typically PUT or PATCH for updates
        response: (options: { body: string }) => {
            const body = JSON.parse(options.body || '{}');
            console.log('Mock API: PUT /api/user/profile', body);

            if (body.username && typeof body.username === 'string') {
                // In a real backend, find user and update
                return {
                    code: 0,
                    message: 'Profile updated successfully',
                    data: { username: body.username } // Return updated part or full user info
                };
            } else {
                return {
                    code: 400,
                    message: 'Invalid profile data',
                    data: null
                };
            }
        },
    },
    // Update Password
    {
        url: '/api/user/password',
        type: 'post',
        response: (options: { body: string }) => {
            const body = JSON.parse(options.body || '{}');
            console.log('Mock API: POST /api/user/password', body);

            // Basic validation
            if (body.current && body.new && body.new.length >= 6) {
                // Simulate checking current password (replace with actual logic if needed)
                if (body.current === 'password123') { // Example: Assume current pass is 'password123'
                    return {
                        code: 0,
                        message: 'Password updated successfully',
                        data: null
                    };
                } else {
                    return {
                        code: 401, // Unauthorized or Forbidden
                        message: '当前密码不正确',
                        data: null
                    };
                }
            } else {
                return {
                    code: 400,
                    message: '无效的密码数据 (新密码至少6位)',
                    data: null
                };
            }
        },
    },
]; 