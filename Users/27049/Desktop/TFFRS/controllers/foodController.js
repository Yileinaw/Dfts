const Food = require('../models/food');
const Rating = require('../models/rating');
const Favorite = require('../models/favorite');
const ViewHistory = require('../models/viewHistory');
const { handleSuccess, handleError } = require('../utils/helpers');
const { authenticateToken } = require('../utils/authMiddleware');

// 获取所有美食列表
exports.getAllFoods = async (req, res) => {
    try {
        const { category_id, difficulty, tag, sort, order, limit = 20, page = 1 } = req.query;
        const offset = (page - 1) * limit;

        const options = {
            limit: parseInt(limit),
            offset: parseInt(offset),
            sort,
            order
        };
        if (category_id) options.category_id = parseInt(category_id);
        if (difficulty) options.difficulty = difficulty;
        if (tag) options.tag = tag;

        const foods = await Food.findAll(options);
        // 可以考虑同时获取总数用于分页
        // const totalFoods = await Food.countAll(options); 

        handleSuccess(res, { foods /*, totalFoods, currentPage: page, totalPages: Math.ceil(totalFoods / limit) */ });
    } catch (error) {
        handleError(res, '获取美食列表失败', 500, error);
    }
};

// 获取美食详情
exports.getFoodById = async (req, res) => {
    try {
        const foodId = req.params.id;
        const food = await Food.findById(foodId);

        if (!food) {
            return handleError(res, '美食不存在', 404);
        }

        // 获取美食评分信息
        const ratings = await Rating.findByFood(foodId);
        const averageRating = await Rating.getAverageRating(foodId);

        // 如果用户已登录，检查是否已收藏和评分
        let isFavorite = false;
        let userRating = null;
        if (req.user) { // authenticateToken 会将用户信息附加到 req.user
            isFavorite = await Favorite.isFavorite(req.user.id, foodId);
            userRating = await Rating.findUserRating(req.user.id, foodId);
            // 异步记录浏览历史，无需等待结果
            ViewHistory.recordView(req.user.id, foodId).catch(err => console.error('记录浏览历史出错:', err));
        }

        handleSuccess(res, {
            food,
            ratings,
            averageRating: averageRating || 0, // 确保有默认值
            isFavorite,
            userRating: userRating ? userRating.rating : null, // 只返回评分值
            userComment: userRating ? userRating.comment : null // 返回评论
        });
    } catch (error) {
        handleError(res, '获取美食详情失败', 500, error);
    }
};

// 搜索美食
exports.searchFoods = async (req, res) => {
    try {
        const { keyword, limit = 20, page = 1 } = req.query;
        const offset = (page - 1) * limit;

        if (!keyword) {
            return handleError(res, '请提供搜索关键词', 400);
        }

        const foods = await Food.search(keyword); // Food.search 也需要支持分页和返回总数
        handleSuccess(res, { foods });
    } catch (error) {
        handleError(res, '搜索美食失败', 500, error);
    }
};

// 获取所有美食分类
exports.getCategories = async (req, res) => {
    try {
        const categories = await Food.getCategories();
        res.json({ success: true, categories });
    } catch (error) {
        console.error('获取分类错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
};

// 获取个性化推荐 (需要登录)
exports.getRecommendations = async (req, res) => {
    try {
        const userId = req.user.id; // 从 authenticateToken 获取
        const { limit = 10 } = req.query;

        const recommendations = await Food.getRecommendedFoods(userId, parseInt(limit));
        handleSuccess(res, { recommendations });
    } catch (error) {
        handleError(res, '获取推荐失败', 500, error);
    }
};

// 获取热门浏览的美食 (公开)
exports.getPopularFoods = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const popularFoods = await ViewHistory.getMostViewedFoods(parseInt(limit));
        handleSuccess(res, popularFoods);
    } catch (error) {
        handleError(res, '获取热门美食失败', 500, error);
    }
};

// === 管理员接口 ===

// 创建新美食
exports.createFood = async (req, res) => {
    try {
        // 验证是否是管理员
        if (req.session.role !== 'admin') {
            return res.status(403).json({ success: false, message: '没有权限执行此操作' });
        }

        const foodData = req.body;

        // 验证必要字段
        if (!foodData.name || !foodData.category) {
            return res.status(400).json({ success: false, message: '名称和分类是必填项' });
        }

        const foodId = await Food.create(foodData);
        res.status(201).json({ success: true, foodId });
    } catch (error) {
        console.error('创建美食错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
};

// 更新美食
exports.updateFood = async (req, res) => {
    try {
        // 验证是否是管理员
        if (req.session.role !== 'admin') {
            return res.status(403).json({ success: false, message: '没有权限执行此操作' });
        }

        const foodId = req.params.id;
        const foodData = req.body;

        // 检查美食是否存在
        const food = await Food.findById(foodId);
        if (!food) {
            return res.status(404).json({ success: false, message: '美食不存在' });
        }

        const success = await Food.update(foodId, foodData);

        if (success) {
            res.json({ success: true, message: '美食更新成功' });
        } else {
            res.status(500).json({ success: false, message: '美食更新失败' });
        }
    } catch (error) {
        console.error('更新美食错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
};

// 删除美食
exports.deleteFood = async (req, res) => {
    try {
        // 验证是否是管理员
        if (req.session.role !== 'admin') {
            return res.status(403).json({ success: false, message: '没有权限执行此操作' });
        }

        const foodId = req.params.id;

        // 检查美食是否存在
        const food = await Food.findById(foodId);
        if (!food) {
            return res.status(404).json({ success: false, message: '美食不存在' });
        }

        const success = await Food.delete(foodId);

        if (success) {
            res.json({ success: true, message: '美食删除成功' });
        } else {
            res.status(500).json({ success: false, message: '美食删除失败' });
        }
    } catch (error) {
        console.error('删除美食错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
}; 