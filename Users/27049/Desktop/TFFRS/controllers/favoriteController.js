const Favorite = require('../models/favorite');

// 获取用户收藏列表
exports.getUserFavorites = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: '请先登录' });
        }

        const favorites = await Favorite.findByUser(userId);
        res.json({ success: true, favorites });
    } catch (error) {
        console.error('获取收藏列表错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
};

// 添加收藏
exports.addFavorite = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { foodId } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, message: '请先登录' });
        }

        if (!foodId) {
            return res.status(400).json({ success: false, message: '缺少美食ID' });
        }

        // 检查是否已收藏
        const isAlreadyFavorite = await Favorite.isFavorite(userId, foodId);
        if (isAlreadyFavorite) {
            return res.status(400).json({ success: false, message: '已经收藏过该美食' });
        }

        const favoriteId = await Favorite.add(userId, foodId);

        if (favoriteId) {
            res.json({ success: true, message: '收藏成功', favoriteId });
        } else {
            res.status(400).json({ success: false, message: '收藏失败，可能已经收藏过该美食' });
        }
    } catch (error) {
        console.error('添加收藏错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
};

// 取消收藏
exports.removeFavorite = async (req, res) => {
    try {
        const userId = req.session.userId;
        const foodId = req.params.foodId;

        if (!userId) {
            return res.status(401).json({ success: false, message: '请先登录' });
        }

        // 检查是否已收藏
        const isAlreadyFavorite = await Favorite.isFavorite(userId, foodId);
        if (!isAlreadyFavorite) {
            return res.status(400).json({ success: false, message: '未收藏过该美食' });
        }

        const success = await Favorite.remove(userId, foodId);

        if (success) {
            res.json({ success: true, message: '取消收藏成功' });
        } else {
            res.status(400).json({ success: false, message: '取消收藏失败' });
        }
    } catch (error) {
        console.error('取消收藏错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
};

// 检查是否已收藏
exports.checkFavorite = async (req, res) => {
    try {
        const userId = req.session.userId;
        const foodId = req.params.foodId;

        if (!userId) {
            return res.json({ success: true, isFavorite: false });
        }

        const isFavorite = await Favorite.isFavorite(userId, foodId);
        res.json({ success: true, isFavorite });
    } catch (error) {
        console.error('检查收藏状态错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
}; 