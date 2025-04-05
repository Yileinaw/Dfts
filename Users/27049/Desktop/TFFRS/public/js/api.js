/**
 * API 调用函数封装
 */

const API_BASE_URL = '/api';

// 通用请求函数
async function fetchAPI(endpoint, options = {}) {
    try {
        const url = API_BASE_URL + endpoint;
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            credentials: 'include' // 包含 cookies
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || '请求失败');
        }

        return data;
    } catch (error) {
        console.error('API请求错误:', error);
        throw error;
    }
}

// 用户相关 API
const AuthAPI = {
    // 注册
    register: (userData) => {
        return fetchAPI('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    // 登录
    login: (credentials) => {
        return fetchAPI('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    },

    // 登出
    logout: () => {
        return fetchAPI('/auth/logout', {
            method: 'POST'
        });
    },

    // 检查登录状态
    checkAuth: () => {
        return fetchAPI('/auth/check');
    },

    // 修改密码
    changePassword: (passwordData) => {
        return fetchAPI('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify(passwordData)
        });
    }
};

// 美食相关 API
const FoodAPI = {
    // 获取美食列表
    getAllFoods: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.category) queryParams.append('category', params.category);
        if (params.sort) queryParams.append('sort', params.sort);
        if (params.order) queryParams.append('order', params.order);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.offset) queryParams.append('offset', params.offset);

        const queryString = queryParams.toString();
        return fetchAPI(`/foods?${queryString}`);
    },

    // 获取单个美食详情
    getFoodById: (id) => {
        return fetchAPI(`/foods/${id}`);
    },

    // 搜索美食
    searchFoods: (keyword) => {
        return fetchAPI(`/foods/search?keyword=${encodeURIComponent(keyword)}`);
    },

    // 获取所有分类
    getCategories: () => {
        return fetchAPI('/foods/categories');
    },

    // 获取推荐
    getRecommendations: (limit = 10) => {
        return fetchAPI(`/foods/recommendations?limit=${limit}`);
    },

    // 管理员: 创建美食
    createFood: (foodData) => {
        return fetchAPI('/foods', {
            method: 'POST',
            body: JSON.stringify(foodData)
        });
    },

    // 管理员: 更新美食
    updateFood: (id, foodData) => {
        return fetchAPI(`/foods/${id}`, {
            method: 'PUT',
            body: JSON.stringify(foodData)
        });
    },

    // 管理员: 删除美食
    deleteFood: (id) => {
        return fetchAPI(`/foods/${id}`, {
            method: 'DELETE'
        });
    }
};

// 收藏相关 API
const FavoriteAPI = {
    // 获取用户收藏列表
    getUserFavorites: () => {
        return fetchAPI('/favorites');
    },

    // 添加收藏
    addFavorite: (foodId) => {
        return fetchAPI('/favorites', {
            method: 'POST',
            body: JSON.stringify({ foodId })
        });
    },

    // 取消收藏
    removeFavorite: (foodId) => {
        return fetchAPI(`/favorites/${foodId}`, {
            method: 'DELETE'
        });
    },

    // 检查是否已收藏
    checkFavorite: (foodId) => {
        return fetchAPI(`/favorites/check/${foodId}`);
    }
};

// 评分相关 API
const RatingAPI = {
    // 获取美食评分列表
    getFoodRatings: (foodId) => {
        return fetchAPI(`/ratings/food/${foodId}`);
    },

    // 获取用户评分列表
    getUserRatings: () => {
        return fetchAPI('/ratings/user');
    },

    // 获取评分最高的美食
    getTopRated: (limit = 10) => {
        return fetchAPI(`/ratings/top?limit=${limit}`);
    },

    // 添加/更新评分
    addRating: (ratingData) => {
        return fetchAPI('/ratings', {
            method: 'POST',
            body: JSON.stringify(ratingData)
        });
    },

    // 删除评分
    deleteRating: (foodId) => {
        return fetchAPI(`/ratings/${foodId}`, {
            method: 'DELETE'
        });
    }
}; 