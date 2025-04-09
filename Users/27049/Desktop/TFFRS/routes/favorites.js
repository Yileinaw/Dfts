const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');

// 获取用户收藏列表
router.get('/', favoriteController.getUserFavorites);

// 添加收藏
router.post('/', favoriteController.addFavorite);

// 删除收藏
router.delete('/:foodId', favoriteController.removeFavorite);

// 检查是否已收藏
router.get('/check/:foodId', favoriteController.checkFavorite);

module.exports = router; 