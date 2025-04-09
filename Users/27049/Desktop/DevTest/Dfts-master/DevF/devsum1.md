# Dfts 项目开发记录 (近期)

本次开发主要围绕前端 Vue 应用的界面优化、功能完善和交互改进，以及修复相关后端问题。

## 主要工作内容：

1.  **后端 CORS 修复:**
    *   解决了"我的收藏"、"我的帖子"、"消息通知"页面因 CORS 问题无法加载数据的问题。
    *   修改了 `backend/src/server.ts`，为 `cors` 中间件添加了详细配置，允许来自前端源 (`http://localhost:5173`) 的请求。

2.  **后端 TypeScript 错误修复:**
    *   修复了 `backend/src/services/PostService.ts` 中 `unlikePost` 函数因缺少实现导致的 `TS2355` 编译错误。
    *   修正了 `unlikePost` 中使用 `prisma.like.delete` 时 `where` 条件的错误（应使用复合键 `userId_postId` 而非 `id`）。

3.  **前端布局与样式优化:**
    *   **我的帖子 (`MyPostsView.vue`):** 布局从简单列表改为卡片式网格布局，复用了 `ShareCard` 组件。
    *   **消息通知 (`NotificationsView.vue`):**
        *   优化了列表项样式，增加间距、边框、背景色。
        *   添加了通知类型图标（点赞、评论、收藏）。
        *   添加了未读通知的左侧指示器。
        *   改进了时间戳显示格式（相对时间）。
        *   解决了样式修改未生效的问题（缓存或文件未更新导致）。
    *   **帖子卡片 (`ShareCard.vue`):**
        *   解决了卡片高度不一致的问题，通过对标题和内容进行截断和设置 `min-height` 实现。
        *   优化了标题区域布局，将其放入独立容器并添加左侧强调边框。
    *   **全局宽屏布局:**
        *   限制了 `MainLayout.vue` 中主内容区域 (`main-content`) 的最大宽度 (`1200px`) 并居中。
        *   为 `body` 添加了全局浅灰色背景 (`#f0f2f5`)，修复了 `main.ts` 中 CSS 导入错误，解决了宽屏下两侧留白过于突兀的问题。
    *   **导航栏 (`Header.vue`):**
        *   修改了布局，使其背景和边框横跨整个屏幕宽度。
        *   内部内容（Logo、菜单、用户区）限制最大宽度并居中，与主内容区域对齐，参考了 B 站的布局风格。

4.  **前端交互与路由改进:**
    *   **帖子详情查看方式:**
        *   将原先点击帖子卡片弹出**模态框**的方式，改为**跳转到独立的帖子详情页** (`/posts/:id`)。
        *   在 `router/index.ts` 中添加了新的动态路由规则。
        *   创建了新的视图组件 `PostDetailView.vue` 用于显示详情。
        *   修改了 `ShareCard.vue` 和 `NotificationsView.vue` 的点击逻辑，使用 `router.push` 进行跳转。
        *   移除了 `HomeView`, `MyPostsView`, `MyFavoritesView`, `NotificationsView` 中与旧模态框相关的逻辑和组件。
        *   调试并解决了动态导入组件时出现的 404 和 500 错误（与路径别名解析、Vite 服务器内部错误有关，通过替换 `v-html` 诊断）。
        *   调试并解决了 Vue Router "No match found" 警告，通过调整路由结构解决。
    *   **`PostDetailView.vue` 完善:**
        *   实现了 Markdown 内容的渲染（引入 `marked` 库）。
        *   添加了针对 Markdown 元素的 `:deep()` 样式。
        *   调整了作者信息和操作栏布局。
        *   实现了评论列表的加载和显示，以及发表评论的功能。
        *   修复了渲染过程中因类型定义不匹配导致的 Linter 错误（`avatarUrl`）。
    *   **导航体验:**
        *   在 `MainLayout.vue` 中为 `<router-view>` 添加了 `<transition>` 实现页面切换动画。
        *   添加了 `<keep-alive>` 来缓存列表页面 (`HomeView`, `DiscoverView` 等)，解决了返回列表页时状态丢失（如标签页选择）的问题。确保了相关组件定义了 `name` 选项。
    *   **点击区域优化:** 统一了 `NotificationsView.vue` 中通知条目的点击行为，使点击空白区域也能跳转。

5.  **其他:**
    *   修复了个人中心 (`/personal-center`) 因路由配置错误导致的双重导航栏问题。
    *   优化了 `ShareCard.vue` 中头像的点击交互，阻止事件冒泡，为将来跳转用户详情页预留。
