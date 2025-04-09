// 用户认证中间件
exports.isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({ success: false, message: '请先登录' });
    }
};

// 管理员权限中间件
exports.isAdmin = (req, res, next) => {
    if (req.session.userId && req.session.role === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: '需要管理员权限' });
    }
};

// 请求日志中间件
exports.requestLogger = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });

    next();
};

// 错误处理中间件
exports.errorHandler = (err, req, res, next) => {
    console.error('服务器错误:', err);

    const statusCode = err.statusCode || 500;
    const message = err.message || '服务器内部错误';

    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
}; 