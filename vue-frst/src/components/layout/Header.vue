<template>
  <el-header class="header">
    <!-- Add inner container for content alignment -->
    <div class="header-content">
      <div class="logo" @click="goToHome">
        <!-- 稍后替换为真实 logo -->
        <!-- <img src="@/assets/images/logo.png" alt="美食分享 Logo" /> -->
        <span>美食分享</span>
      </div>
      <el-menu mode="horizontal" router :default-active="$route.path" class="nav-menu">
        <el-menu-item index="/">主页</el-menu-item>
        <el-menu-item index="/discover">发现美食</el-menu-item>
        <el-menu-item index="/community">美食社区</el-menu-item>
      </el-menu>
      <div class="user-section">
        <!-- 根据登录状态显示不同内容 -->
        <template v-if="!userStore.isLoggedIn">
          <el-button type="primary" @click="goToLogin">登录</el-button>
          <el-button @click="goToRegister">注册</el-button>
        </template>
        <template v-else>
           <el-dropdown>
              <span class="el-dropdown-link">
                <el-avatar :size="32" :src="userStore.resolvedAvatarUrl" /> 
                <span class="username">{{ userStore.userName }}</span>
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="goToProfile">个人中心</el-dropdown-item>
                  <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
        </template>
      </div>
    </div>
  </el-header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/modules/user' // 引入 User Store
import { ArrowDown } from '@element-plus/icons-vue' // 引入图标

const router = useRouter()
const userStore = useUserStore() // 获取 Store 实例

const goToHome = () => {
  router.push('/')
}

const goToLogin = () => {
  router.push('/login')
}

const goToRegister = () => {
  router.push('/register')
}

const goToProfile = () => {
  router.push('/personal-center') // 跳转到个人中心根路径
}

// 处理登出
const handleLogout = () => {
  userStore.logout() // 调用 Store 的 logout action 清理状态
  router.push('/login') // 在 Header 组件中执行跳转
}

</script>

<style scoped lang="scss">
.header {
  // Remove flex layout and padding from the main header element
  // display: flex;
  // align-items: center;
  // justify-content: space-between;
  // padding: 0 50px; 
  border-bottom: 1px solid var(--el-border-color-light);
  background-color: #fff;
  height: 60px;
  width: 100%; // Ensure it spans full width
}

// New container for inner content
.header-content {
    max-width: 1200px; // Match main content max-width
    margin: 0 auto; // Center the content
    display: flex;
    align-items: center;
    height: 100%; // Occupy full header height
    padding: 0 20px; // Add horizontal padding inside the content area
}

.logo {
  display: flex;
  align-items: center;
  cursor: pointer;
  img {
    height: 40px;
    margin-right: 10px;
  }
  span {
    font-size: 22px;
    font-weight: 600;
    color: var(--el-color-primary);
  }
}

.nav-menu {
  border-bottom: none; 
  flex-grow: 1; // Restore flex-grow to fill space
  margin: 0 40px; 
  height: 100%; // 确保菜单项垂直居中

  .el-menu-item {
    font-size: 16px;
    height: 100%;
    display: inline-flex; // 确保垂直居中
    align-items: center;
    border-bottom: 2px solid transparent; // 移除默认下划线，为激活状态准备
    &:hover {
      background-color: transparent; // 移除默认 hover 背景
      color: var(--el-color-primary);
    }
    &.is-active {
       border-bottom-color: var(--el-color-primary); // 激活时显示下划线
       color: var(--el-color-primary) !important; // 覆盖默认激活颜色
       background-color: transparent !important; // 覆盖默认激活背景
    }
  }
}

.user-section {
  display: flex;
  align-items: center;
  .el-dropdown-link {
    cursor: pointer;
    display: flex;
    align-items: center;
    color: var(--el-text-color-primary); // 使用主要文字颜色
    outline: none; // 移除焦点时的轮廓
    .el-avatar {
      margin-right: 8px;
    }
    .username {
        margin-right: 5px; // 用户名和下拉图标间距
        max-width: 100px; // 限制最大宽度防止过长
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
  }
}
</style> 