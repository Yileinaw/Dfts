const express = require('express');
const router = express.Router();
const viewHistoryController = require('../controllers/viewHistoryController');
const { authenticateToken } = require('../utils/authMiddleware');

// --- 需要登录的路由 ---

// 记录用户浏览了某个美食 (挂载在 foods 路由下更合适)
// POST /api/foods/:id/view 

// 获取当前用户的浏览历史
router.get('/history', authenticateToken, viewHistoryController.getUserHistory);

// 清空当前用户的浏览历史
router.delete('/history', authenticateToken, viewHistoryController.clearUserHistory);

// --- 公开访问的路由 ---

// 获取热门浏览的美食 (挂载在 foods 路由下更合适)
// GET /api/foods/popular

// 注意：记录浏览和获取热门的路由更适合放在 foods.js 路由文件中，以便于API结构统一。
// 这里暂时只定义获取和清除用户历史的路由。

module.exports = router; 