<template>
  <div class="auth-layout">
    <el-container class="auth-container">
      <el-main class="auth-main">
        <router-view /> <!-- 认证相关页面将在这里渲染 -->
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
// 认证布局逻辑 (如果需要)
</script>

<style scoped lang="scss">
.auth-layout {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5; // 或者使用背景图片
}

.auth-container {
  width: 400px; // 可以根据需要调整宽度
  padding: 40px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.auth-main {
  padding: 0; // ElMain 默认有 padding，这里去掉
}
</style> 