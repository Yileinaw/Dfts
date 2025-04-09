<template>
  <div class="personal-center-layout">
    <el-container>
      <el-aside width="200px" class="sidebar">
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical-demo"
          router 
        >
          <el-menu-item index="/personal-center/profile">
            <el-icon><setting /></el-icon>
            <span>个人资料</span>
          </el-menu-item>
          <el-menu-item index="/personal-center/posts">
             <el-icon><document /></el-icon>
            <span>我的帖子</span>
          </el-menu-item>
          <el-menu-item index="/personal-center/favorites">
             <el-icon><star /></el-icon>
            <span>我的收藏</span>
          </el-menu-item>
          <el-menu-item index="/personal-center/notifications">
             <el-icon><bell /></el-icon>
            <span>消息通知</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view v-slot="{ Component }">
           <!-- <keep-alive> --> 
                <component :is="Component" />
           <!-- </keep-alive> -->
        </router-view>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { Setting, Document, Star, Bell } from '@element-plus/icons-vue';
import { ElContainer, ElAside, ElMain, ElMenu, ElMenuItem, ElIcon } from 'element-plus';

const route = useRoute();

// Compute the active menu item based on the current route
const activeMenu = computed(() => {
    // Find the closest matching menu item path
    if (route.path.startsWith('/personal-center/profile')) return '/personal-center/profile';
    if (route.path.startsWith('/personal-center/posts')) return '/personal-center/posts';
    if (route.path.startsWith('/personal-center/favorites')) return '/personal-center/favorites';
    if (route.path.startsWith('/personal-center/notifications')) return '/personal-center/notifications';
    return '/personal-center/profile'; // Default
});

</script>

<style scoped>
.personal-center-layout {
  height: calc(100vh - 60px); /* Adjust 60px based on your header height */
}

.el-container {
  height: 100%;
}

.sidebar {
  background-color: #f4f4f5; /* Light grey background */
  border-right: 1px solid #e4e7ed;
}

.el-menu {
  border-right: none; /* Remove default border */
  background-color: transparent; /* Inherit background */
}

.el-menu-item {
    justify-content: center;
}

.el-menu-item span {
    margin-left: 10px;
}


.el-main {
  padding: 20px;
}
</style> 