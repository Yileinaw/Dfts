const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');
const viewHistoryController = require('../controllers/viewHistoryController');
const { authenticateToken, isAdmin } = require('../utils/authMiddleware');

// --- 公开访问的路由 ---

// 获取所有美食（支持过滤、排序、分页）
router.get('/', foodController.getAllFoods);

// 搜索美食（支持分页）
router.get('/search', foodController.searchFoods);

// 获取热门浏览的美食
router.get('/popular', foodController.getPopularFoods);

// 获取美食详情 (可选地在获取详情时记录浏览)
// 注意: recordFoodView 需要 authenticateToken, 但 getFoodById 不一定需要
// 方案1: 分开路由
// router.get('/:id', foodController.getFoodById);
// router.post('/:id/view', authenticateToken, viewHistoryController.recordFoodView); 
// 方案2: 在 getFoodById 控制器内部处理（如当前实现）
router.get('/:id', authenticateToken, foodController.getFoodById);

// --- 需要登录的路由 ---

// 获取个性化推荐美食
router.get('/recommendations', authenticateToken, foodController.getRecommendations);

// 记录用户浏览了某个美食 (移到 GET /:id 内部处理，此路由不再需要)
// router.post('/:id/view', authenticateToken, viewHistoryController.recordFoodView);

// --- 管理员接口 (需要管理员权限) ---

// 创建新美食
router.post('/', authenticateToken, isAdmin, foodController.createFood);

// 更新美食
router.put('/:id', authenticateToken, isAdmin, foodController.updateFood);

// 删除美食
router.delete('/:id', authenticateToken, isAdmin, foodController.deleteFood);

module.exports = router; 