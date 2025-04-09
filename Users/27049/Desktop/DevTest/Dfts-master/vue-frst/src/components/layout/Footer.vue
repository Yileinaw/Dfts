<template>
  <el-footer class="footer">
    <p>&copy; {{ currentYear }} 美食分享平台. 保留所有权利.</p>
    <p>
      <!-- 实际项目中可以链接到真实页面 -->
      <el-link :underline="false">关于我们</el-link>
      <el-divider direction="vertical"></el-divider>
      <el-link :underline="false">联系方式</el-link>
      <el-divider direction="vertical"></el-divider>
      <el-link :underline="false">隐私条款</el-link>
    </p>
  </el-footer>
</template>

<script setup>
import { ref } from 'vue'

const currentYear = ref(new Date().getFullYear())
</script>

<style scoped lang="scss">
.footer {
  height: auto; 
  padding: 25px 50px;
  text-align: center;
  color: var(--el-text-color-secondary);
  background-color: #f5f7fa; // 更柔和的背景色
  border-top: 1px solid var(--el-border-color-lighter);
  margin-top: 50px; 

  p {
    margin: 8px 0;
    font-size: 14px;
  }

  .el-link {
    font-size: 14px;
    color: var(--el-text-color-secondary);
    &:hover {
      color: var(--el-color-primary);
    }
  }
  
  .el-divider--vertical {
    margin: 0 15px;
    height: 1em; // 确保分割线和文字对齐
  }
}
</style> 