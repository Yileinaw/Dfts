import type { CollectionItem } from '@/types/collection';
// Ensure Mock.js is installed: npm install mockjs --save-dev
import Mock from 'mockjs';

// Simple in-memory store for mock collections
let mockCollections: CollectionItem[] = [
    {
        id: 1,
        collectedId: 101,
        type: 'post',
        title: '社区帖子：美味的周末早午餐分享',
        imageUrl: 'https://via.placeholder.com/150/FFA07A/000000?text=Post1',
        collectedAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        link: '/community/post/101'
    },
    {
        id: 2,
        collectedId: 205,
        type: 'food',
        title: '特色菜品：秘制红烧肉',
        imageUrl: 'https://via.placeholder.com/150/98FB98/000000?text=Food1',
        collectedAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
        link: '/food/205'
    },
    {
        id: 3,
        collectedId: 108,
        type: 'post',
        title: '探店笔记：城中最火的咖啡馆',
        imageUrl: 'https://via.placeholder.com/150/ADD8E6/000000?text=Post2',
        collectedAt: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
        link: '/community/post/108'
    },
];

// Helper type for mock options (optional)
interface MockOptions {
    url: string;
    type: string;
    body: any;
}

export default [
    // Get Collections
    {
        url: '/api/user/collections',
        type: 'get',
        response: () => {
            console.log('Mock API: GET /api/user/collections');
            return {
                code: 0,
                message: 'Success',
                data: [...mockCollections], // Return a copy to prevent direct modification
            };
        },
    },
    // Remove Collection
    {
        // Match URL like /api/user/collections/1, /api/user/collections/2, etc.
        url: /\/api\/user\/collections\/(\d+)/,
        type: 'delete',
        response: (options: MockOptions) => { // Use MockOptions type
            const match = options.url.match(/\/api\/user\/collections\/(\d+)/);
            const idToRemove = match ? parseInt(match[1], 10) : null;
            console.log(`Mock API: DELETE /api/user/collections/${idToRemove}`);

            if (idToRemove !== null) {
                const initialLength = mockCollections.length;
                mockCollections = mockCollections.filter((item: CollectionItem) => item.id !== idToRemove);
                if (mockCollections.length < initialLength) {
                    return {
                        code: 0,
                        message: 'Collection removed successfully',
                        data: null
                    };
                } else {
                    return {
                        code: 404, // Or another appropriate code
                        message: 'Collection item not found',
                        data: null
                    };
                }
            } else {
                return {
                    code: 400,
                    message: 'Invalid collection ID in URL',
                    data: null
                };
            }
        },
    },
]; 