<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <router-view />
</template>

<style lang="scss">
/* 全局样式可以放在这里，或者更好地放在 src/assets/styles/base.scss */

/* 引入 Element Plus 样式 (如果 main.js 中没有全局引入) */
// @import 'element-plus/dist/index.css';

/* 可以在这里定义一些全局基础样式 */
body {
  margin: 0;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #303133; // Element Plus 默认主要文字颜色
}

#app {
  min-height: 100vh; // 确保应用容器至少占满视口高度
}

/* 可以添加一些全局辅助类 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px; /* 恢复并稍微增大左右内边距 */
}
</style>
