const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');

// 获取美食评分列表
router.get('/food/:foodId', ratingController.getFoodRatings);

// 获取用户评分列表
router.get('/user', ratingController.getUserRatings);

// 获取评分最高的美食
router.get('/top', ratingController.getTopRated);

// 添加/更新评分
router.post('/', ratingController.addRating);

// 删除评分
router.delete('/:foodId', ratingController.deleteRating);

module.exports = router; 