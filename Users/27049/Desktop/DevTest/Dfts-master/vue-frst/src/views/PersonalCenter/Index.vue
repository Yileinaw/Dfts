<template>
  <el-container class="personal-center-layout">
    <el-aside width="200px" class="sidebar">
      <el-menu 
        router 
        :default-active="$route.path" 
        class="sidebar-menu"
      >
        <el-menu-item index="/personal-center/profile">
          <el-icon><UserFilled /></el-icon>
          <span>个人信息</span>
        </el-menu-item>
        <el-menu-item index="/personal-center/favorites">
          <el-icon><Star /></el-icon>
          <span>我的收藏</span>
        </el-menu-item>
        <el-menu-item index="/personal-center/my-posts">
          <el-icon><Document /></el-icon>
          <span>我的帖子</span>
        </el-menu-item>
        <el-menu-item index="/personal-center/notifications">
          <el-icon><Bell /></el-icon>
          <span>消息通知</span>
        </el-menu-item>
        <el-menu-item index="/personal-center/settings">
          <el-icon><Setting /></el-icon>
          <span>账号设置</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-main class="content">
      <router-view v-slot="{ Component }">
         <!-- Temporarily disable transition -->
         <!-- <transition name="fade" mode="out-in"> -->
            <component :is="Component" />
          <!-- </transition> -->
      </router-view> 
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { UserFilled, Setting, Star, Document, Bell } from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { onMounted, watch } from 'vue'

const router = useRouter()
const route = useRoute()

// Function to check route and redirect if necessary
const checkAndRedirect = () => {
  // Check if the current path is exactly the base personal center path
  if (route.path === '/personal-center') {
    console.log('Current path is /personal-center, redirecting to profile...');
    router.replace('/personal-center/profile'); // Use replace to avoid history entry
  }
}

// Check on component mount
onMounted(() => {
  checkAndRedirect();
})

// Also watch for route changes, although less likely needed for initial load
// watch(() => route.path, checkAndRedirect);

</script>

<style scoped lang="scss">
.personal-center-layout {
  min-height: calc(100vh - 120px);
  background-color: #f5f7fa;
}

.sidebar {
  background-color: #fff;
  border-right: 1px solid var(--el-border-color-light);
  padding-top: 20px;

  .sidebar-menu {
    border-right: none;
    height: 100%;

    .el-menu-item {
      font-size: 15px;
      &:hover {
        background-color: var(--el-color-primary-light-9);
      }
      &.is-active {
        background-color: var(--el-color-primary-light-8);
        color: var(--el-color-primary);
        font-weight: bold;
      }
       .el-icon {
         margin-right: 8px;
       }
    }
  }
}

.content {
  padding: 30px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 