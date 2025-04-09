/**
 * 应用主文件
 */

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', initApp);

// 应用初始化
function initApp() {
    // 初始化事件监听
    initEventListeners();

    // 初始化认证事件
    initAuthEvents();

    // 加载首页数据
    loadHomePageData();

    // 初始化路由
    initRouter();

    console.log('应用初始化完成');
}

// 初始化事件监听
function initEventListeners() {
    // 导航菜单点击
    document.querySelectorAll('.main-nav a').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const page = this.dataset.page;
            if (page) {
                navigateTo(page);
            }
        });
    });

    // 移动端菜单切换
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', function () {
            this.classList.toggle('active');
            document.getElementById('nav-menu').classList.toggle('show');
        });
    }

    // 搜索按钮点击
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }

    // 搜索框回车
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }

    // 模态框关闭
    const closeModalBtn = document.querySelector('.close-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    // 点击模态框外部关闭
    const modal = document.getElementById('modal');
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === this) {
                closeModal();
            }
        });
    }
}

// 加载首页数据
async function loadHomePageData() {
    try {
        // 加载精选推荐
        loadFeaturedFoods();

        // 加载美食分类
        loadCategories();
    } catch (error) {
        console.error('加载首页数据失败:', error);
    }
}

// 加载精选推荐
async function loadFeaturedFoods() {
    try {
        const featuredContainer = document.getElementById('featured-foods');
        if (!featuredContainer) return;

        // 显示加载中
        featuredContainer.innerHTML = '<div class="loading">加载中...</div>';

        // 获取评分最高的美食
        const response = await RatingAPI.getTopRated(6);

        if (response.success && response.foods && response.foods.length > 0) {
            // 清空容器
            featuredContainer.innerHTML = '';

            // 渲染美食卡片
            response.foods.forEach(food => {
                featuredContainer.appendChild(createFoodCard(food));
            });
        } else {
            featuredContainer.innerHTML = '<p class="no-data">暂无推荐美食</p>';
        }
    } catch (error) {
        console.error('加载精选推荐失败:', error);
        const featuredContainer = document.getElementById('featured-foods');
        if (featuredContainer) {
            featuredContainer.innerHTML = '<p class="error">加载失败，请刷新重试</p>';
        }
    }
}

// 加载美食分类
async function loadCategories() {
    try {
        const categoryContainer = document.getElementById('category-list');
        if (!categoryContainer) return;

        // 显示加载中
        categoryContainer.innerHTML = '<div class="loading">加载中...</div>';

        // 获取所有分类
        const response = await FoodAPI.getCategories();

        if (response.success && response.categories && response.categories.length > 0) {
            // 清空容器
            categoryContainer.innerHTML = '';

            // 渲染分类卡片
            response.categories.forEach(category => {
                categoryContainer.appendChild(createCategoryCard(category));
            });
        } else {
            categoryContainer.innerHTML = '<p class="no-data">暂无分类数据</p>';
        }
    } catch (error) {
        console.error('加载分类失败:', error);
        const categoryContainer = document.getElementById('category-list');
        if (categoryContainer) {
            categoryContainer.innerHTML = '<p class="error">加载失败，请刷新重试</p>';
        }
    }
}

// 创建美食卡片
function createFoodCard(food) {
    const card = document.createElement('div');
    card.className = 'food-card';
    card.dataset.id = food.id;

    // 生成星级评分显示
    const stars = '★'.repeat(Math.round(food.avg_rating || 0)) + '☆'.repeat(5 - Math.round(food.avg_rating || 0));

    card.innerHTML = `
    <div class="food-image" style="background-image: url('${food.image || '/img/default-food.jpg'}')"></div>
    <div class="food-info">
      <h3>${food.name}</h3>
      <p>${food.description ? (food.description.length > 80 ? food.description.substring(0, 80) + '...' : food.description) : '暂无描述'}</p>
      <div class="food-meta">
        <span class="category">${food.category}</span>
        <div class="rating">
          <span class="stars">${stars}</span>
          <span>(${food.rating_count || 0})</span>
        </div>
      </div>
    </div>
  `;

    // 点击卡片查看详情
    card.addEventListener('click', () => {
        navigateTo('food-detail', { id: food.id });
    });

    return card;
}

// 创建分类卡片
function createCategoryCard(category) {
    const card = document.createElement('div');
    card.className = 'category-item';

    // 根据分类名称选择图标
    let icon = '🍽️'; // 默认图标

    // 根据不同分类设置不同图标
    if (category.toLowerCase().includes('中餐')) icon = '🥢';
    else if (category.toLowerCase().includes('西餐')) icon = '🍴';
    else if (category.toLowerCase().includes('日料')) icon = '🍣';
    else if (category.toLowerCase().includes('甜点')) icon = '🍰';
    else if (category.toLowerCase().includes('饮品')) icon = '🍹';
    else if (category.toLowerCase().includes('快餐')) icon = '🍔';
    else if (category.toLowerCase().includes('烧烤')) icon = '🍢';
    else if (category.toLowerCase().includes('火锅')) icon = '🍲';

    card.innerHTML = `
    <div class="category-icon">${icon}</div>
    <h3>${category}</h3>
  `;

    // 点击分类筛选美食
    card.addEventListener('click', () => {
        navigateTo('foods', { category });
    });

    return card;
}

// 处理搜索
function handleSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    const keyword = searchInput.value.trim();
    if (keyword) {
        navigateTo('search-results', { keyword });
    }
}

// 显示模态框
function showModal(content, title = '') {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');

    if (!modal || !modalBody) return;

    // 设置标题和内容
    modalBody.innerHTML = '';

    if (title) {
        const titleElement = document.createElement('h2');
        titleElement.className = 'modal-title';
        titleElement.textContent = title;
        modalBody.appendChild(titleElement);
    }

    // 如果内容是 HTML 字符串
    if (typeof content === 'string') {
        modalBody.innerHTML += content;
    } else {
        // 如果内容是 DOM 元素
        modalBody.appendChild(content);
    }

    // 显示模态框
    modal.style.display = 'block';

    // 防止页面滚动
    document.body.style.overflow = 'hidden';
}

// 关闭模态框
function closeModal() {
    const modal = document.getElementById('modal');
    if (!modal) return;

    modal.style.display = 'none';
    document.body.style.overflow = '';
}

// 显示通知
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // 添加到页面
    document.body.appendChild(notification);

    // 显示动画
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // 自动移除
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
} 