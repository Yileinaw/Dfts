<template>
  <el-container class="personal-center-layout">
    <el-aside width="200px" class="sidebar">
      <el-menu 
        router 
        :default-active="$route.path" 
        class="sidebar-menu"
      >
        <el-menu-item index="/personal">
          <el-icon><UserFilled /></el-icon>
          <span>个人信息</span>
        </el-menu-item>
        <el-menu-item index="/personal/settings">
          <el-icon><Setting /></el-icon>
          <span>账号设置</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-main class="content">
      <router-view v-slot="{ Component }">
         <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
      </router-view> 
    </el-main>
  </el-container>
</template>

<script setup>
import { UserFilled, Setting } from '@element-plus/icons-vue'
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