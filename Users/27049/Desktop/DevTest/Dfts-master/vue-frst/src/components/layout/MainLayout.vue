<template>
  <el-container class="main-layout">
    <AppHeader />
    <el-main class="main-content">
      <router-view /> <!-- 页面内容将在这里渲染 -->
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
  // padding: 20px; // 移除这里的内边距
  // 可以根据需要设置最大宽度并居中
  // max-width: 1200px;
  // margin: 0 auto;
}
</style> 