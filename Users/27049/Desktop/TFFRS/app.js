const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// 导入路由
const authRoutes = require('./routes/auth');
const foodRoutes = require('./routes/foods');
const favoriteRoutes = require('./routes/favorites');
const ratingRoutes = require('./routes/ratings');
const categoryRoutes = require('./routes/categories');
const viewHistoryRoutes = require('./routes/viewHistory');

// 导入中间件
const { requestLogger, errorHandler } = require('./utils/middlewares');

// 初始化应用
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(requestLogger);

// 会话配置
app.use(session({
    secret: 'tffrs_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24小时
    }
}));

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/user', viewHistoryRoutes);

// 前端页面路由 - 将所有非API请求转发到前端入口
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
});

// 错误处理中间件
app.use(errorHandler);

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器启动成功，监听端口 ${PORT}`);
});

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
    console.error('未捕获的异常:', err);
    process.exit(1);
});

module.exports = app; 