# 美食推荐平台前端 (FRST-git) 开发方案

## 1. 项目目标

构建一个功能完善、用户体验良好、技术栈现代化的美食推荐与社区分享平台的前端 Web 应用。

## 2. 技术选型

- **框架:** Vue 3 (Composition API)
- **构建工具:** Vite
- **语言:** TypeScript
- **路由:** Vue Router 4
- **状态管理:** Pinia
- **HTTP 请求:** Axios
- **UI 库:** Element Plus (或其他选定 UI 库)
- **CSS 预处理器:** Sass (`.scss`)
- **代码规范:** ESLint, Prettier, EditorConfig
- **版本控制:** Git

## 3. 开发环境

- Node.js: >= 18.x
- 包管理器: pnpm (推荐)

## 4. 项目结构 (建议)

```
├── public/                     # 静态资源 (不会被 Vite 处理)
├── src/                        # 源代码目录
│   ├── api/                    # API 请求模块 (按模块划分, e.g., auth.ts, restaurant.ts)
│   ├── assets/                 # 静态资源 (会被 Vite 处理)
│   │   ├── fonts/
│   │   ├── images/
│   │   └── styles/             # 全局样式 (base.scss, variables.scss, theme.scss)
│   ├── components/             # 全局/通用组件
│   │   ├── basic/              # 基础原子组件 (如果UI库不满足或需封装)
│   │   └── business/           # 业务相关通用组件 (e.g., RestaurantCard.vue)
│   ├── config/                 # 项目配置 (常量, 枚举, 环境配置读取)
│   ├── hooks/                  # 自定义 Composition API Hooks (e.g., useAuth.ts, usePagination.ts)
│   ├── layouts/                # 页面布局组件 (e.g., DefaultLayout.vue, AuthLayout.vue)
│   ├── locale/                 # 国际化文件 (如果需要)
│   ├── router/                 # 路由配置 (index.ts, routes.ts, guards.ts)
│   ├── store/                  # Pinia 状态管理
│   │   ├── modules/            # 各功能模块 store (e.g., auth.ts, user.ts, restaurant.ts)
│   │   └── index.ts            # Pinia 实例创建和插件注册
│   ├── types/                  # TypeScript 类型定义 (global.d.ts, api.d.ts, components.d.ts)
│   ├── utils/                  # 工具函数 (e.g., request.ts, validators.ts, formatters.ts)
│   ├── views/                  # 页面级组件 (与路由对应, 按功能模块组织)
│   │   ├── auth/               # 认证相关页面 (LoginView.vue, RegisterView.vue)
│   │   ├── home/               # 首页
│   │   ├── discover/           # 发现页
│   │   ├── profile/            # 用户中心
│   │   ├── community/          # 社区
│   │   ├── collection/         # 收藏
│   │   └── errors/             # 错误页面 (404.vue, 500.vue)
│   ├── App.vue                 # 根组件
│   └── main.ts                 # 入口文件 (初始化 Vue, Router, Pinia, UI库等)
├── .env                        # 默认环境变量 (本地, 不提交 Git)
├── .env.development            # 开发环境变量
├── .env.production             # 生产环境变量
├── .editorconfig               # 编辑器配置
├── .eslintignore               # ESLint 忽略配置
├── .eslintrc.cjs               # ESLint 配置
├── .gitignore                  # Git 忽略配置
├── .prettierignore             # Prettier 忽略配置
├── .prettierrc.json            # Prettier 配置
├── index.html                  # HTML 入口模板
├── LICENSE                     # 开源许可证 (如果需要)
├── package.json                # 项目依赖与脚本
├── pnpm-lock.yaml              # pnpm 依赖锁定文件
├── tsconfig.json               # TypeScript 编译配置
├── tsconfig.node.json          # TypeScript Node 环境配置 (Vite 配置等)
├── vite.config.ts              # Vite 构建配置
└── ReadmeDev.md                # 开发方案文档 (本文件)
```

## 5. 核心模块开发计划

参照 `project_overview.html` 中的原型图和 ER 图进行开发。

### 阶段 0: 项目初始化与基础架构 (1-2 天)

- **任务:**
    - 使用 Vite (`pnpm create vite frst-git --template vue-ts`) 创建项目。
    - 安装核心依赖: `vue`, `vue-router@4`, `pinia`, `axios`。
    - 安装 UI 库: `element-plus`。
    - 安装开发依赖: `@types/node`, `typescript`, `vite`, `vue-tsc`, `eslint`, `prettier`, 相关 ESLint/Prettier 插件, `sass`。
    - 配置 Vite: 设置 `@` 路径别名, 开发服务器代理 (如果需要)。
    - 配置 ESLint & Prettier: 统一代码风格, 推荐使用 `@vue/eslint-config-typescript/recommended` 和 `eslint-config-prettier`。
    - 搭建推荐的项目结构。
    - 创建基础布局 (`src/layouts/DefaultLayout.vue`) 和认证布局 (`src/layouts/AuthLayout.vue`)。
    - 配置基础路由 (`src/router/index.ts`, `src/router/routes.ts`), 定义路由元信息 (meta) 用于布局和守卫。
    - 创建 404 页面 (`src/views/errors/404.vue`)。
    - 设置全局 CSS (`src/assets/styles/base.scss`), 引入 UI 库样式, 定义 CSS 变量 (`src/assets/styles/variables.scss`)。
    - 在 `main.ts` 中初始化 Vue、Router、Pinia 和 Element Plus。
    - 初始化 Git 仓库, 配置 `.gitignore`, 提交初始骨架代码 (`git commit -m "chore: Initial project setup"`).
- **产出:** 一个包含基础布局、路由和配置的可运行项目骨架。

### 阶段 1: 用户认证模块 (3-5 天)

- **任务:**
    - **Store:** 创建 `src/store/modules/auth.ts` (管理 token, 登录状态) 和 `src/store/modules/user.ts` (管理用户信息)。
    - **API:** 封装 Axios 实例 (`src/utils/request.ts`), 设置请求/响应拦截器 (自动添加 Token, 统一错误处理)。创建 `src/api/auth.ts` 定义登录、注册、获取验证码、登出、找回密码等接口函数。定义相关请求和响应的 TypeScript 类型 (`src/types/api.d.ts`)。
    - **页面 & 组件:**
        - 创建 `LoginView.vue` 和 `RegisterView.vue` (`src/views/auth/`)。
        - 使用 Element Plus 的 `ElForm`, `ElInput`, `ElButton` 等组件构建登录和注册表单。
        - 实现表单校验 (使用 Element Plus 自带校验或结合 `async-validator`)。
        - 实现获取验证码的按钮、倒计时及 API 调用。
        - 调用 API 和 Pinia actions 完成登录、注册逻辑。
        - 创建密码找回相关页面和组件。
    - **路由:** 实现路由守卫 (`src/router/guards.ts`), 根据登录状态进行页面访问控制。
    - **登出:** 实现登出功能 (清除 token 和用户信息, 跳转登录页)。
- **产出:** 完整的用户注册、登录 (密码/验证码)、登出、密码找回功能和路由权限控制。

### 阶段 2: 用户中心模块 (2-4 天)

- **任务:**
    - **API:** 创建 `src/api/user.ts` 定义获取/更新用户资料、修改密码、绑定/解绑邮箱/手机等接口。更新 `src/types/api.d.ts`。
    - **页面 & 组件:**
        - 创建用户中心主页面 (`src/views/profile/Index.vue`)，可能包含 Tabs 或侧边栏导航。
        - 创建子组件/页面用于展示和编辑基本信息、账号安全设置、隐私设置。
        - 使用 Element Plus 组件构建信息展示和编辑表单。
        - 实现头像上传组件 (使用 `ElUpload`), 包括预览和调用上传 API。
        - 对接修改密码、绑定/解绑等功能的 API。
        - 添加账号注销的入口和确认提示。
    - **Store:** 更新 `user.ts` store 以支持用户信息的获取和更新。
- **产出:** 用户可以查看和修改个人资料、管理账号安全设置。

### 阶段 3: 首页与发现模块 (4-6 天)

- **任务:**
    - **Store:** 创建 `src/store/modules/home.ts` (首页数据) 和 `src/store/modules/restaurant.ts` (餐厅列表、详情、筛选条件)。
    - **API:** 创建 `src/api/home.ts`, `src/api/restaurant.ts` 定义获取推荐、搜索餐厅、获取餐厅详情、获取筛选选项等接口。更新 `src/types/api.d.ts`。
    - **页面 & 组件:**
        - **首页 (`src/views/home/Index.vue`):** 实现城市定位/选择(可能需要对接地图服务 API)、搜索入口、快速分类入口、"猜你喜欢"推荐列表、附近热门列表、社区动态预览。
        - **发现页 (`src/views/discover/Index.vue`):** 实现多维度筛选器 (菜系、场景、价格等)、排序控件、餐厅/美食列表展示。
        - **餐厅详情页 (`src/views/restaurant/Detail.vue`):** 展示餐厅基本信息 (名称、评分、人均、地址、电话、营业时间、图集)、(可选)菜品展示、用户评价列表、添加/查看评价入口、收藏按钮。
        - **通用组件:**
            - `RestaurantCard.vue` (`src/components/business/`): 可复用的餐厅信息卡片。
            - `FilterBar.vue` (`src/components/business/`): 可复用的筛选/排序栏 (如果逻辑复杂)。
    - **逻辑:** 调用 API 获取数据, 使用 Pinia 管理状态, 在组件中渲染数据。实现筛选、排序、分页或无限滚动加载逻辑。
- **产出:** 功能完整的首页、发现页和餐厅详情页。

### 阶段 4: 美食社区模块 (5-7 天)

- **任务:**
    - **Store:** 创建 `src/store/modules/community.ts` (动态流、帖子详情、评论、关注状态)。
    - **API:** 创建 `src/api/community.ts`, `src/api/post.ts`, `src/api/user.ts` (如果关注放这里) 定义获取动态流、发布动态、获取动态详情、点赞/取消、评论/回复、关注/取关等接口。更新 `src/types/api.d.ts`。
    - **页面 & 组件:**
        - **社区首页 (`src/views/community/Index.vue`):** 实现 "推荐"、"关注" Tab 切换的动态信息流 (Feed)。
        - **动态详情页 (`src/views/community/PostDetail.vue`):** 展示动态完整内容、图片/视频、位置、标签、评论列表。
        - **发布动态页/弹窗 (`src/views/community/CreatePost.vue` or Modal):** 实现图文输入、图片/视频上传、位置选择、标签添加功能。
        - **通用组件:**
            - `PostItem.vue` (`src/components/business/`): 单条动态展示组件。
            - `CommentList.vue` (`src/components/business/`): 评论列表及回复组件。
    - **逻辑:** 实现动态加载、点赞、评论、回复、关注/取关等交互逻辑及 API 调用, 更新 Store 状态。可能需要内容安全审核的集成。
- **产出:** 用户可以浏览、发布、互动 (点赞、评论、关注) 的社区功能。

### 阶段 5: 收藏模块 (2-3 天)

- **任务:**
    - **Store:** 创建 `src/store/modules/collection.ts` (收藏列表、收藏夹)。
    - **API:** 创建 `src/api/collection.ts` 定义获取收藏列表、添加/取消收藏、(可选)创建/编辑/删除收藏夹等接口。更新 `src/types/api.d.ts`。
    - **页面 & 组件:**
        - **我的收藏页 (`src/views/collection/Index.vue`):** 展示用户收藏的餐厅列表, (可选) 支持按收藏夹筛选。
        - (可选) 收藏夹管理页面/组件。
    - **逻辑:** 在餐厅详情页、餐厅卡片等处实现添加/取消收藏按钮的交互和 API 调用, 同步更新收藏页面和 Store。
- **产出:** 用户可以收藏餐厅并在个人中心查看和管理收藏。

### 阶段 6: 测试、优化与部署 (持续进行)

- **任务:**
    - **代码审查 (Code Review):** 定期进行，确保代码质量和一致性。
    - **测试:**
        - **单元测试 (Unit Testing):** 使用 Vitest 测试核心工具函数、Store actions/getters、组合式函数 (Hooks)。
        - **组件测试 (Component Testing):** 使用 Vitest 或 @vue/test-utils 测试关键业务组件。 (可选但推荐)
        - **端到端测试 (E2E Testing):** 使用 Cypress 或 Playwright 测试关键用户流程 (登录、注册、搜索、下单等)。 (可选)
    - **性能优化:**
        - **代码分割:** 利用 Vite 和 Vue Router 的动态导入实现路由懒加载。
        - **组件懒加载:** 对于非首屏或不常用的大型组件按需加载。
        - **资源优化:** 图片压缩、使用 WebP 格式、SVG 图标。
        - **合理使用缓存:** 利用 Pinia 和浏览器缓存减少重复请求。
        - **虚拟滚动:** 对于长列表 (如动态流、评论) 使用虚拟滚动技术。
    - **体验优化:**
        - 添加必要的加载状态 (Loading Spinners/Skeletons)。
        - 提供清晰的错误提示和用户反馈 (使用 Element Plus 的 Message/Notification)。
        - 优化表单交互和校验提示。
        - 确保良好的响应式布局，适配不同屏幕尺寸。
        - 考虑 Web 可访问性 (Accessibility, WAI-ARIA)。
    - **构建与部署:**
        - 配置 `.env.production` 中的生产环境 API 地址等。
        - 运行 `pnpm run build` 进行打包。
        - 编写部署脚本或 CI/CD 配置。
        - 将 `dist` 目录部署到服务器 (Nginx, Vercel, Netlify 等)。
- **产出:** 一个稳定、高效、用户体验良好、可部署的线上应用。

## 6. API 对接规范

- 优先与后端共同定义清晰、规范的 API 接口文档 (推荐使用 OpenAPI/Swagger)。
- 遵循 RESTful 设计风格。
- 统一请求方法 (GET, POST, PUT, DELETE 等) 的使用场景。
- 统一请求头规范 (如 `Content-Type: application/json`, `Authorization: Bearer <token>`)。
- 统一响应体结构, 包含状态码、消息和数据字段，例如:
  ```json
  // 成功
  { "code": 0, "message": "Success", "data": { ... } }
  // 业务错误
  { "code": 1001, "message": "用户名或密码错误", "data": null }
  // 服务器错误
  { "code": 5000, "message": "Internal Server Error", "data": null }
  ```
- API 版本管理 (如 `/api/v1/...`)。
- 在后端接口未就绪时，可使用 Mock 工具 (如 Mock.js, MSW, 或 Apifox/Postman 的 Mock Server) 进行开发和联调。

## 7. 代码规范与质量

- **强制遵循:** 项目配置的 ESLint 和 Prettier 规则。运行 `pnpm run lint` 和 `pnpm run format` 检查和修复。
- **TypeScript:** 开启并遵循严格模式 (`strict: true` in `tsconfig.json`)。为 API 数据、Store state、组件 props/emits 等编写明确的类型定义。
- **命名规范:**
    - 组件: 大驼峰命名法 (PascalCase), e.g., `RestaurantCard.vue`。
    -变量/函数: 小驼峰命名法 (camelCase), e.g., `fetchUserData`, `isLoading`。
    - 常量: 全大写下划线 (UPPER_SNAKE_CASE), e.g., `API_BASE_URL`。
    - TS 类型/接口: 大驼峰命名法 (PascalCase), e.g., `interface UserProfile`。
- **代码风格:** 简洁、清晰、可读。避免过长的函数和组件。适当添加 JSDoc 注释解释复杂逻辑或公共接口。
- **组件化:** 高内聚、低耦合。遵循单向数据流。合理拆分组件，提高复用性。Props 定义清晰，Emits 事件明确。
- **Composition API:** 优先使用 `<script setup>` 语法。逻辑相关的 state、computed、watch、methods 组织在一起。善用自定义 Hooks (`src/hooks/`) 封装可复用逻辑。
- **错误处理:** 对 API 请求、异步操作进行恰当的错误捕获和处理，向用户提供友好提示。
- **避免魔法数字/字符串:** 使用常量或枚举 (`src/config/`) 替代。
- **代码审查:** 定期进行 Code Review，互相学习，共同提升代码质量。

## 8. 版本控制 (Git)

- **工作流:** 推荐使用 Git Flow 或 GitHub Flow。
    - `main`/`master`: 稳定的生产分支。
    - `develop`: 开发主分支，汇集功能分支。
    - `feature/xxx`: 功能开发分支。
    - `fix/xxx`: Bug 修复分支。
    - `release/xxx`: (Git Flow) 发布准备分支。
    - `hotfix/xxx`: (Git Flow) 紧急线上 Bug 修复分支。
- **分支命名:** 清晰描述分支目的, e.g., `feature/user-login`, `fix/avatar-upload-bug`。
- **提交信息 (Commit Message):** 遵循 Conventional Commits 规范 (https://www.conventionalcommits.org/)。
    - 格式: `<type>(<scope>): <subject>`
    - `type`: feat, fix, build, chore, ci, docs, perf, refactor, revert, style, test。
    - `scope`: 可选，表示影响范围 (e.g., auth, ui, store)。
    - `subject`: 简洁描述，动词开头，小写。
    - 示例: `feat(auth): implement email registration form`, `fix(ui): correct button alignment on mobile`。
- **提交频率:** 小步、频繁提交，保持提交的原子性。
- **代码合并:** 使用 Pull Request (PR) / Merge Request (MR) 进行代码合并，必须通过 Code Review 和 CI 检查 (如果配置了)。禁止直接向 `develop` 或 `main` 分支推送代码。
- **解决冲突:** 拉取最新目标分支代码 (`git pull origin develop`), 在本地解决冲突后再提交。

## 9. 开发工具

- **IDE:** Visual Studio Code (推荐)
    - **插件:** Volar (Vue 3 支持), ESLint, Prettier, EditorConfig for VS Code, GitLens, Auto Import。
- **浏览器:** Chrome / Edge / Firefox (最新版)
    - **插件:** Vue Devtools (必备)。
- **其他:** Postman / Apifox (API 测试), Figma / Sketch (查看设计稿)。

## 10. 沟通与协作

- 使用项目管理工具 (如 Jira, Trello, Teambition) 跟踪任务进度。
- 定期进行简短站会 (Daily Standup) 同步进度和阻塞。
- 通过即时通讯工具 (如 Slack, DingTalk, WeChat Work) 进行快速沟通。
- 重要决策和设计变更应有文档记录。

---
*本文档基于项目初步需求和通用实践编写，具体细节可在开发过程中根据实际情况调整和完善。*
