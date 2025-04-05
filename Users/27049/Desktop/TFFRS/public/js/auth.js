/**
 * 认证相关功能
 */

// 当前用户信息
let currentUser = null;

// 检查用户登录状态
async function checkUserAuth() {
    try {
        const response = await AuthAPI.checkAuth();

        if (response.authenticated) {
            // 用户已登录
            currentUser = response.user;
            updateUIForLoggedInUser();
        } else {
            // 用户未登录
            currentUser = null;
            updateUIForLoggedOutUser();
        }

        return currentUser;
    } catch (error) {
        console.error('认证检查失败:', error);
        currentUser = null;
        updateUIForLoggedOutUser();
        return null;
    }
}

// 更新UI显示已登录用户
function updateUIForLoggedInUser() {
    // 显示用户菜单，隐藏登录注册按钮
    document.getElementById('before-login').style.display = 'none';
    document.getElementById('after-login').style.display = 'flex';

    // 显示用户名
    const usernameDisplay = document.getElementById('username-display');
    if (usernameDisplay) {
        usernameDisplay.textContent = currentUser.username;
    }

    // 如果是管理员，显示管理员菜单
    if (currentUser.role === 'admin') {
        // 添加管理员菜单项
        const dropdown = document.querySelector('.dropdown-menu');

        // 检查管理员菜单是否已存在
        if (!document.getElementById('admin-menu-item')) {
            const adminMenuItem = document.createElement('a');
            adminMenuItem.id = 'admin-menu-item';
            adminMenuItem.href = '#';
            adminMenuItem.dataset.page = 'admin';
            adminMenuItem.textContent = '管理后台';

            // 在登出按钮前插入
            const logoutBtn = document.getElementById('logout-btn');
            dropdown.insertBefore(adminMenuItem, logoutBtn);
        }
    }
}

// 更新UI显示未登录状态
function updateUIForLoggedOutUser() {
    // 显示登录注册按钮，隐藏用户菜单
    document.getElementById('before-login').style.display = 'flex';
    document.getElementById('after-login').style.display = 'none';

    // 移除管理员菜单项
    const adminMenuItem = document.getElementById('admin-menu-item');
    if (adminMenuItem) {
        adminMenuItem.remove();
    }
}

// 处理登录表单提交
async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    // 表单验证
    if (!username || !password) {
        showFormError('login-error', '用户名和密码不能为空');
        return;
    }

    try {
        const response = await AuthAPI.login({ username, password });

        if (response.success) {
            // 登录成功
            currentUser = response.user;
            updateUIForLoggedInUser();

            // 关闭登录模态框
            closeModal();

            // 显示成功消息
            showNotification('登录成功', 'success');

            // 跳转到首页
            navigateTo('home');
        } else {
            showFormError('login-error', response.message || '登录失败');
        }
    } catch (error) {
        showFormError('login-error', error.message || '登录失败');
    }
}

// 处理注册表单提交
async function handleRegister(event) {
    event.preventDefault();

    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    // 表单验证
    if (!username || !email || !password || !confirmPassword) {
        showFormError('register-error', '所有字段都是必填的');
        return;
    }

    if (password !== confirmPassword) {
        showFormError('register-error', '两次输入的密码不一致');
        return;
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showFormError('register-error', '请输入有效的邮箱地址');
        return;
    }

    try {
        const response = await AuthAPI.register({ username, email, password });

        if (response.success) {
            // 注册成功
            currentUser = response.user;
            updateUIForLoggedInUser();

            // 关闭注册模态框
            closeModal();

            // 显示成功消息
            showNotification('注册成功', 'success');

            // 跳转到首页
            navigateTo('home');
        } else {
            showFormError('register-error', response.message || '注册失败');
        }
    } catch (error) {
        showFormError('register-error', error.message || '注册失败');
    }
}

// 处理用户登出
async function handleLogout() {
    try {
        await AuthAPI.logout();

        // 清除用户信息
        currentUser = null;
        updateUIForLoggedOutUser();

        // 显示成功消息
        showNotification('成功退出登录', 'success');

        // 跳转到首页
        navigateTo('home');
    } catch (error) {
        console.error('登出失败:', error);
        showNotification('登出失败: ' + error.message, 'error');
    }
}

// 显示表单错误
function showFormError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

// 初始化认证事件监听
function initAuthEvents() {
    // 为登出按钮添加事件监听
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }

    // 页面加载后检查用户认证状态
    checkUserAuth();
} 