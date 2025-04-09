<template>
  <el-container class="main-layout">
    <AppHeader />
    <el-main class="main-content">
      <!-- Wrap router-view with keep-alive and transition -->
      <router-view v-slot="{ Component }">
        <keep-alive include="HomeView,DiscoverView,CommunityView,MyPostsView,MyFavoritesView">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </keep-alive>
      </router-view>
    </el-main>
    <AppFooter />
  </el-container>
</template>

<script setup>
import AppHeader from './Header.vue'
import AppFooter from './Footer.vue'
</script>

<style scoped lang="scss">
.main-layout {
  min-height: 100vh; // 确保布局至少占满整个视口高度
  display: flex;
  flex-direction: column;
}

.main-content {
  flex-grow: 1; // 让主内容区域填充可用空间
  // Add max-width, centering, and padding for better layout on wide screens
  max-width: 1200px;
  width: 100%; // Ensure it takes full width up to max-width
  margin-left: auto;
  margin-right: auto;
  padding: 20px; // Add padding around the content area
}

/* Define transition styles */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease; /* Adjust timing as needed */
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 