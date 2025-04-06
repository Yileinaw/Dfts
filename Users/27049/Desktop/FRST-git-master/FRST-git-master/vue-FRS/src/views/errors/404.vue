<template>
  <el-result
    icon="error"
    title="404 Not Found"
    sub-title="抱歉，你访问的页面不存在"
  >
    <template #extra>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </template>
  </el-result>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  router.push('/');
};
</script>

<style scoped>
/* 如果需要自定义样式 */
</style> 