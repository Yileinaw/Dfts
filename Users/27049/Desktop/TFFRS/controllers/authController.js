const User = require('../models/user');

// 登录控制器
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 验证输入
        if (!username || !password) {
            return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
        }

        // 查找用户
        const user = await User.findByUsername(username);
        if (!user) {
            return res.status(401).json({ success: false, message: '用户名或密码错误' });
        }

        // 验证密码
        const isPasswordValid = await User.comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: '用户名或密码错误' });
        }

        // 创建会话
        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.role = user.role;

        // 响应成功
        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                role: user.role
            }
        });
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
};

// 注册控制器
exports.register = async (req, res) => {
    try {
        const { username, password, email } = req.body;

        // 验证输入
        if (!username || !password || !email) {
            return res.status(400).json({ success: false, message: '所有字段都是必填的' });
        }

        // 检查用户名是否已存在
        const existingUser = await User.findByUsername(username);
        if (existingUser) {
            return res.status(400).json({ success: false, message: '用户名已被使用' });
        }

        // 创建新用户
        const userId = await User.create({ username, password, email });

        // 创建会话
        req.session.userId = userId;
        req.session.username = username;
        req.session.role = 'user'; // 默认角色

        // 响应成功
        res.status(201).json({
            success: true,
            user: {
                id: userId,
                username,
                email,
                role: 'user'
            }
        });
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
};

// 登出控制器
exports.logout = (req, res) => {
    // 销毁会话
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ success: false, message: '退出登录失败' });
        }

        // 清除cookie
        res.clearCookie('connect.sid');
        res.json({ success: true, message: '成功退出登录' });
    });
};

// 检查当前用户会话
exports.checkAuth = (req, res) => {
    if (req.session.userId) {
        res.json({
            authenticated: true,
            user: {
                id: req.session.userId,
                username: req.session.username,
                role: req.session.role
            }
        });
    } else {
        res.json({ authenticated: false });
    }
};

// 修改密码
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: '请先登录' });
        }

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: '当前密码和新密码不能为空' });
        }

        // 获取用户信息
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: '用户不存在' });
        }

        // 验证当前密码
        const isPasswordValid = await User.comparePassword(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: '当前密码错误' });
        }

        // 更新密码
        await User.updatePassword(userId, newPassword);

        res.json({ success: true, message: '密码修改成功' });
    } catch (error) {
        console.error('修改密码错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
}; 