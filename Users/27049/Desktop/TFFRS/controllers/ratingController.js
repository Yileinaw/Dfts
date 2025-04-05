const Rating = require('../models/rating');

// 获取美食的评分列表
exports.getFoodRatings = async (req, res) => {
    try {
        const foodId = req.params.foodId;

        if (!foodId) {
            return res.status(400).json({ success: false, message: '缺少美食ID' });
        }

        const ratings = await Rating.findByFood(foodId);
        const averageRating = await Rating.getAverageRating(foodId);

        res.json({
            success: true,
            ratings,
            average: averageRating.average,
            count: averageRating.count
        });
    } catch (error) {
        console.error('获取评分列表错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
};

// 获取用户的评分列表
exports.getUserRatings = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: '请先登录' });
        }

        const ratings = await Rating.findByUser(userId);
        res.json({ success: true, ratings });
    } catch (error) {
        console.error('获取用户评分列表错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
};

// 添加评分
exports.addRating = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { foodId, rating, comment } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, message: '请先登录' });
        }

        if (!foodId || !rating) {
            return res.status(400).json({ success: false, message: '缺少必要参数' });
        }

        // 验证评分值
        const ratingValue = parseInt(rating);
        if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
            return res.status(400).json({ success: false, message: '评分必须是1-5之间的整数' });
        }

        // 检查用户是否已经评价过该美食
        const existingRating = await Rating.findUserRating(userId, foodId);

        let result;
        if (existingRating) {
            // 更新已有评分
            result = await Rating.update(userId, foodId, { rating: ratingValue, comment });
            if (result) {
                res.json({ success: true, message: '评分更新成功' });
            } else {
                res.status(500).json({ success: false, message: '评分更新失败' });
            }
        } else {
            // 创建新评分
            const ratingId = await Rating.create({
                user_id: userId,
                food_id: foodId,
                rating: ratingValue,
                comment
            });

            if (ratingId) {
                res.status(201).json({ success: true, message: '评分添加成功', ratingId });
            } else {
                res.status(400).json({ success: false, message: '评分添加失败' });
            }
        }
    } catch (error) {
        console.error('添加评分错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
};

// 删除评分
exports.deleteRating = async (req, res) => {
    try {
        const userId = req.session.userId;
        const foodId = req.params.foodId;

        if (!userId) {
            return res.status(401).json({ success: false, message: '请先登录' });
        }

        // 检查是否存在该评分
        const existingRating = await Rating.findUserRating(userId, foodId);
        if (!existingRating) {
            return res.status(404).json({ success: false, message: '评分不存在' });
        }

        const success = await Rating.delete(userId, foodId);

        if (success) {
            res.json({ success: true, message: '评分删除成功' });
        } else {
            res.status(500).json({ success: false, message: '评分删除失败' });
        }
    } catch (error) {
        console.error('删除评分错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
};

// 获取评分最高的美食
exports.getTopRated = async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const topRated = await Rating.getTopRated(limit);

        res.json({ success: true, foods: topRated });
    } catch (error) {
        console.error('获取评分最高美食错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
}; 