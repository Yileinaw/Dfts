const ViewHistory = require('../models/viewHistory');
const Food = require('../models/food'); // 可能需要用于验证 foodId
const { handleSuccess, handleError } = require('../utils/helpers');

// 记录用户浏览美食 (需要登录)
exports.recordFoodView = async (req, res) => {
    const userId = req.user.id; // 从 authenticateToken 中间件获取
    const foodId = req.params.id;

    try {
        // 可选：验证 foodId 是否有效
        const foodExists = await Food.findById(foodId);
        if (!foodExists) {
            return handleError(res, '未找到指定的美食', 404);
        }

        const success = await ViewHistory.recordView(userId, foodId);
        if (success) {
            handleSuccess(res, { message: '浏览记录已更新' });
        } else {
            handleError(res, '更新浏览记录失败', 500);
        }
    } catch (error) {
        handleError(res, '记录浏览失败', 500, error);
    }
};

// 获取当前用户的浏览历史 (需要登录)
exports.getUserHistory = async (req, res) => {
    const userId = req.user.id;
    const { limit = 20 } = req.query;

    try {
        const history = await ViewHistory.getUserViewHistory(userId, parseInt(limit));
        handleSuccess(res, history);
    } catch (error) {
        handleError(res, '获取浏览历史失败', 500, error);
    }
};

// 获取热门浏览的美食 (公开)
exports.getPopularFoods = async (req, res) => {
    const { limit = 10 } = req.query;
    try {
        const popularFoods = await ViewHistory.getMostViewedFoods(parseInt(limit));
        handleSuccess(res, popularFoods);
    } catch (error) {
        handleError(res, '获取热门美食失败', 500, error);
    }
};

// 清除当前用户的浏览历史 (需要登录)
exports.clearUserHistory = async (req, res) => {
    const userId = req.user.id;
    try {
        const success = await ViewHistory.deleteUserViewHistory(userId);
        if (success) {
            handleSuccess(res, { message: '浏览历史已清空' });
        } else {
            // 理论上，即使没有历史记录，删除操作也可能返回 0 affectedRows，不算严格错误
            handleSuccess(res, { message: '浏览历史已清空或原本为空' });
        }
    } catch (error) {
        handleError(res, '清空浏览历史失败', 500, error);
    }
}; 