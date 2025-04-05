/**
 * 简单的前端路由器
 */

// 当前活动页面
let currentPage = 'home';

// 页面数据
let pageParams = {};

// 页面加载器映射表
const pageLoaders = {
    'home': loadHomePage,
    'foods': loadFoodsPage,
    'food-detail': loadFoodDetailPage,
    'login': loadLoginPage,
    'register': loadRegisterPage,
    'profile': loadProfilePage,
    'favorites': loadFavoritesPage,
    'ratings': loadRatingsPage,
    'search-results': loadSearchResultsPage,
    'recommend': loadRecommendPage,
    'admin': loadAdminPage
};

// 需要登录的页面
const authRequiredPages = [
    'profile',
    'favorites',
    'ratings',
    'admin'
];

// 管理员专属页面
const adminPages = [
    'admin'
];

// 初始化路由器
function initRouter() {
    // 根据URL判断初始页面
    const path = window.location.pathname;
    const hash = window.location.hash;

    // 如果有hash, 从hash中提取页面
    if (hash) {
        const hashPage = hash.substring(1);
        navigateTo(hashPage);
    }
    // 否则根据path判断
    else if (path !== '/' && path !== '/index.html') {
        // 从路径中提取页面名称
        const pathSegments = path.split('/').filter(Boolean);
        if (pathSegments.length > 0) {
            const page = pathSegments[0];
            const params = {};

            // 如果有ID参数
            if (pathSegments.length > 1 && page === 'food') {
                params.id = pathSegments[1];
                navigateTo('food-detail', params);
            } else {
                navigateTo(page);
            }
        } else {
            navigateTo('home');
        }
    } else {
        navigateTo('home');
    }
}

// 导航到指定页面
function navigateTo(page, params = {}) {
    // 保存页面参数
    pageParams = params;

    // 检查是否需要登录
    if (authRequiredPages.includes(page)) {
        if (!currentUser) {
            showNotification('请先登录', 'error');
            loadLoginPage();
            return;
        }

        // 检查是否需要管理员权限
        if (adminPages.includes(page) && currentUser.role !== 'admin') {
            showNotification('需要管理员权限', 'error');
            navigateTo('home');
            return;
        }
    }

    // 更新当前页面
    currentPage = page;

    // 更新导航栏活动项
    updateActiveNavItem();

    // 加载页面内容
    const loadPage = pageLoaders[page] || loadNotFoundPage;
    loadPage();

    // 更新URL
    updateURL();

    // 滚动到顶部
    window.scrollTo(0, 0);
}

// 更新URL
function updateURL() {
    let url;

    switch (currentPage) {
        case 'food-detail':
            url = `/food/${pageParams.id}`;
            break;
        case 'search-results':
            url = `/search?q=${encodeURIComponent(pageParams.keyword || '')}`;
            break;
        case 'foods':
            if (pageParams.category) {
                url = `/foods?category=${encodeURIComponent(pageParams.category)}`;
            } else {
                url = '/foods';
            }
            break;
        case 'home':
            url = '/';
            break;
        default:
            url = `/${currentPage}`;
    }

    // 使用 history API 更新 URL
    history.pushState(
        { page: currentPage, params: pageParams },
        document.title,
        url
    );
}

// 更新导航栏活动项
function updateActiveNavItem() {
    // 移除所有活动类
    document.querySelectorAll('.main-nav a').forEach(link => {
        link.classList.remove('active');
    });

    // 添加当前页面活动类
    let pageToActivate = currentPage;

    // 特殊处理: 食品详情页激活"美食浏览"菜单
    if (currentPage === 'food-detail') {
        pageToActivate = 'foods';
    }

    // 特殊处理: 搜索结果页不激活任何菜单
    if (currentPage === 'search-results') {
        return;
    }

    const activeLink = document.querySelector(`.main-nav a[data-page="${pageToActivate}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// 在主内容区域显示页面
function showPage(pageId, content) {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    // 移除所有活动页面
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // 查找或创建页面容器
    let pageContainer = document.getElementById(`page-${pageId}`);

    if (!pageContainer) {
        pageContainer = document.createElement('div');
        pageContainer.id = `page-${pageId}`;
        pageContainer.className = 'page';
        mainContent.appendChild(pageContainer);
    }

    // 设置页面内容并激活
    pageContainer.innerHTML = content;
    pageContainer.classList.add('active');
}

// 以下是各页面加载器

// 加载首页
function loadHomePage() {
    const currentHomePage = document.getElementById('page-home');
    if (currentHomePage) {
        currentHomePage.classList.add('active');
        loadHomePageData();
    }
}

// 加载美食浏览页
function loadFoodsPage() {
    const category = pageParams.category || '';

    // 创建页面内容
    let content = `
    <div class="container">
      <h1 class="page-title">美食浏览</h1>
      
      ${category ? `<h2 class="category-title">分类: ${category}</h2>` : ''}
      
      <div class="filters">
        <div class="filter-group">
          <label for="category-filter">分类</label>
          <select id="category-filter">
            <option value="">全部分类</option>
            <!-- 分类选项将通过JS动态加载 -->
          </select>
        </div>
        
        <div class="filter-group">
          <label for="sort-filter">排序</label>
          <select id="sort-filter">
            <option value="id">最新上架</option>
            <option value="name">名称</option>
            <option value="calories">卡路里</option>
            <option value="prep_time">准备时间</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="order-filter">顺序</label>
          <select id="order-filter">
            <option value="desc">降序</option>
            <option value="asc">升序</option>
          </select>
        </div>
      </div>
      
      <div class="food-grid" id="foods-grid">
        <div class="loading">加载中...</div>
      </div>
    </div>
  `;

    // 显示页面
    showPage('foods', content);

    // 加载分类选项
    loadCategoryOptions();

    // 加载美食列表
    loadFoodsList();

    // 绑定筛选器事件
    document.getElementById('category-filter').addEventListener('change', loadFoodsList);
    document.getElementById('sort-filter').addEventListener('change', loadFoodsList);
    document.getElementById('order-filter').addEventListener('change', loadFoodsList);

    // 如果有分类参数，设置分类筛选器
    if (category) {
        setTimeout(() => {
            const categoryFilter = document.getElementById('category-filter');
            if (categoryFilter) {
                categoryFilter.value = category;
            }
        }, 100);
    }
}

// 加载分类选项
async function loadCategoryOptions() {
    try {
        // 获取所有分类
        const response = await FoodAPI.getCategories();

        if (response.success && response.categories) {
            const categoryFilter = document.getElementById('category-filter');
            if (!categoryFilter) return;

            // 保留第一个"全部分类"选项
            const firstOption = categoryFilter.options[0];
            categoryFilter.innerHTML = '';
            categoryFilter.appendChild(firstOption);

            // 添加分类选项
            response.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categoryFilter.appendChild(option);
            });
        }
    } catch (error) {
        console.error('加载分类选项失败:', error);
    }
}

// 加载美食列表
async function loadFoodsList() {
    try {
        const foodsGrid = document.getElementById('foods-grid');
        if (!foodsGrid) return;

        foodsGrid.innerHTML = '<div class="loading">加载中...</div>';

        // 获取筛选器值
        const categoryFilter = document.getElementById('category-filter');
        const sortFilter = document.getElementById('sort-filter');
        const orderFilter = document.getElementById('order-filter');

        const params = {
            category: categoryFilter ? categoryFilter.value : '',
            sort: sortFilter ? sortFilter.value : '',
            order: orderFilter ? orderFilter.value : 'desc',
            limit: 20
        };

        // 获取美食列表
        const response = await FoodAPI.getAllFoods(params);

        if (response.success && response.foods) {
            foodsGrid.innerHTML = '';

            if (response.foods.length > 0) {
                // 渲染美食卡片
                response.foods.forEach(food => {
                    foodsGrid.appendChild(createFoodCard(food));
                });
            } else {
                foodsGrid.innerHTML = '<p class="no-data">暂无符合条件的美食</p>';
            }
        } else {
            foodsGrid.innerHTML = '<p class="error">加载失败，请刷新重试</p>';
        }
    } catch (error) {
        console.error('加载美食列表失败:', error);
        const foodsGrid = document.getElementById('foods-grid');
        if (foodsGrid) {
            foodsGrid.innerHTML = '<p class="error">加载失败，请刷新重试</p>';
        }
    }
}

// 其他页面加载器，根据实际需求实现...
function loadFoodDetailPage() {
    // 实现食品详情页加载逻辑
}

function loadLoginPage() {
    const loginForm = `
    <div class="form-container">
      <h2 class="form-title">用户登录</h2>
      <form id="login-form">
        <div class="form-group">
          <label for="login-username">用户名</label>
          <input type="text" id="login-username" required>
        </div>
        <div class="form-group">
          <label for="login-password">密码</label>
          <input type="password" id="login-password" required>
        </div>
        <div id="login-error" class="form-error" style="display: none;"></div>
        <button type="submit" class="form-submit">登录</button>
        <p class="form-switch">
          还没有账号？<a href="#" id="switch-to-register">立即注册</a>
        </p>
      </form>
    </div>
  `;

    showPage('login', loginForm);

    // 绑定表单提交事件
    document.getElementById('login-form').addEventListener('submit', handleLogin);

    // 绑定切换到注册表单
    document.getElementById('switch-to-register').addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('register');
    });
}

function loadRegisterPage() {
    const registerForm = `
    <div class="form-container">
      <h2 class="form-title">用户注册</h2>
      <form id="register-form">
        <div class="form-group">
          <label for="register-username">用户名</label>
          <input type="text" id="register-username" required>
        </div>
        <div class="form-group">
          <label for="register-email">电子邮箱</label>
          <input type="email" id="register-email" required>
        </div>
        <div class="form-group">
          <label for="register-password">密码</label>
          <input type="password" id="register-password" required>
        </div>
        <div class="form-group">
          <label for="register-confirm-password">确认密码</label>
          <input type="password" id="register-confirm-password" required>
        </div>
        <div id="register-error" class="form-error" style="display: none;"></div>
        <button type="submit" class="form-submit">注册</button>
        <p class="form-switch">
          已有账号？<a href="#" id="switch-to-login">立即登录</a>
        </p>
      </form>
    </div>
  `;

    showPage('register', registerForm);

    // 绑定表单提交事件
    document.getElementById('register-form').addEventListener('submit', handleRegister);

    // 绑定切换到登录表单
    document.getElementById('switch-to-login').addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('login');
    });
}

function loadProfilePage() {
    // 实现个人资料页加载逻辑
}

function loadFavoritesPage() {
    // 实现收藏页加载逻辑
}

function loadRatingsPage() {
    // 实现评分页加载逻辑
}

function loadSearchResultsPage() {
    // 实现搜索结果页加载逻辑
}

function loadRecommendPage() {
    // 实现个性推荐页加载逻辑
}

function loadAdminPage() {
    // 实现管理后台页加载逻辑
}

// 404页面
function loadNotFoundPage() {
    const notFoundContent = `
    <div class="container not-found">
      <h1>404</h1>
      <h2>页面不存在</h2>
      <p>您访问的页面不存在或已被移除。</p>
      <a href="#" onclick="navigateTo('home'); return false;" class="btn">返回首页</a>
    </div>
  `;

    showPage('not-found', notFoundContent);
}

// 监听浏览器前进/后退按钮
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.page) {
        currentPage = event.state.page;
        pageParams = event.state.params || {};

        const loadPage = pageLoaders[currentPage] || loadNotFoundPage;
        loadPage();
        updateActiveNavItem();
    } else {
        navigateTo('home');
    }
}); 