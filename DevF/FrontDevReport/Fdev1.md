# 前端开发文档 - TDFRS 项目 (vue-frst)

本文档记录了 TDFRS 项目前端部分 (`vue-frst`) 的主要开发过程和关键决策点。

## 1. 项目初始化与技术选型

*   **框架:** 选择 Vue.js 3 作为核心前端框架。
*   **构建工具:** 使用 Vite 进行项目构建和开发服务器管理。
*   **语言:** 主要使用 TypeScript 和 Vue 单文件组件 (.vue)。
*   **项目结构:** 初始化标准的 Vue + Vite 项目结构，项目目录命名为 `vue-frst`。

## 2. 核心功能与组件开发

开发了以下主要视图和组件：

*   **视图 (Views):**
    *   `HomeView.vue`: 应用首页。
    *   `DiscoverView.vue`: 发现页面。
    *   `CommunityView.vue`: 社区页面。
    *   `auth/LoginView.vue`: 用户登录页面。
    *   `auth/RegisterView.vue`: 用户注册页面。
    *   `PersonalCenter/Index.vue`: 个人中心主页。
    *   `PersonalCenter/UserProfile.vue`: 用户资料页面。
    *   `PersonalCenter/AccountSettings.vue`: 账户设置页面。
*   **通用组件 (Common Components):**
    *   `ShareCard.vue`: 可复用的分享卡片组件。

## 3. 代码规范与质量保证

*   **Linter/Formatter:** 集成 ESLint 和 Prettier 以强制执行代码风格和查找潜在错误。
*   **错误修复:** 解决了开发过程中遇到的 Linter 报告的错误和警告。

## 4. 环境配置

*   **环境变量:** 配置了 `.env` 文件来管理不同环境（开发、生产）下的配置，例如 API 端点地址。

## 5. 版本控制 (Git)

*   **仓库初始化:** 最初在 `vue-frst` 目录下初始化了 Git 仓库。
*   **父仓库:** 为了管理整个 TDFRS 项目（可能包含后端等），在父目录 `TDFRS` 下初始化了主 Git 仓库。
*   **Gitlink 问题:** 在将 `vue-frst` 添加到父仓库时，由于其内部已存在 `.git` 目录，导致 GitHub 将其识别为 Git submodule/gitlink，而不是普通目录。
*   **问题解决:**
    1.  使用 `git rm --cached vue-frst` 命令从父仓库的索引中移除了 `vue-frst` 的 submodule 记录（保留本地文件）。
    2.  使用 `git add vue-frst` 命令将 `vue-frst` 目录及其内容作为普通文件重新添加到父仓库的暂存区。
    3.  提交更改：`git commit -m "fix: Treat vue-frst as a directory instead of gitlink"`。
    4.  推送至远程仓库：`git push origin master`。
*   **行尾符问题 (CRLF/LF):** 在 Windows 环境下进行 Git 操作时，出现了关于行尾符 (CRLF 将被替换为 LF) 的警告。这些警告通常由 Git 的 `autocrlf` 配置引起，旨在统一不同操作系统的行尾符。虽然提示了警告，但通常不会影响代码功能。

## 6. 后续步骤

*   根据需求继续开发新功能和组件。
*   进行单元测试和集成测试。
*   优化性能和用户体验。
*   部署到生产环境。 