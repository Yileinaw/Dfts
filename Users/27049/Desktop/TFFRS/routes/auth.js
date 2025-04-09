const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 注册路由
router.post('/register', authController.register);

// 登录路由
router.post('/login', authController.login);

// 登出路由
router.post('/logout', authController.logout);

// 检查认证状态
router.get('/check', authController.checkAuth);

// 修改密码
router.post('/change-password', authController.changePassword);

module.exports = router; 