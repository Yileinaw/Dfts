const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateToken, isAdmin } = require('../utils/authMiddleware'); // 假设有权限中间件

// 公开访问的路由
router.get('/', categoryController.getAllCategories);         // 获取所有分类列表
router.get('/:id', categoryController.getCategoryById);       // 获取单个分类信息
router.get('/:id/foods', categoryController.getFoodsByCategory); // 获取分类下的美食列表

// 需要管理员权限的路由 (可选)
// router.post('/', authenticateToken, isAdmin, categoryController.createCategory);
// router.put('/:id', authenticateToken, isAdmin, categoryController.updateCategory);
// router.delete('/:id', authenticateToken, isAdmin, categoryController.deleteCategory);

module.exports = router; 